import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

// peer to peer distributed file system
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../../config'

import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../artifacts/contracts/Market.sol/NFTMarket.json'

import {
  provider, signer
} from '../../components/Navigation'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  useEffect(() => {
    if (provider === null) return (<p className="py-10 px-20 text-3xl">please connect first</p>)
  }, [])
  
  async function onChange(e) {
    const file = e.target.files[0]
    
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }


  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) {
      toast.error("Missing Input Field!!!!! ", {
        position: toast.POSITION.BOTTOM_LEFT
      });
      return
    }
    
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function createSale(url) {
    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()
    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
    await transaction.wait()
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="mt-8 mb-8 w-1/2 flex flex-col pb-12">
        <h1 className="text-2xl"> create new item </h1>
        <h3 className="text-md text-gray-300"> file types supported: gif, jpg, png, svg </h3>
        <div className="mt-7">
         <input
            type="file"
            name="NFT"
            className="form-inputs"
            onChange={onChange}
            accept=".jpeg, .gif, .png, .apng, .svg, .bmp"
          />
        </div>
        <div className="place-items-center block grid">
          {
            fileUrl && (
              <img className="rounded mt-4" width="500" src={fileUrl} />
            )
          }
        </div> 
        <div className="mt-7">
          <label className="tracking-wide"> name * </label>
          <input 
            placeholder="NFT name"
            className="form-inputs"
            onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
          />
        </div>
        <div className="mt-7">
          <label className="tracking-wide"> description </label>
          <textarea
            placeholder="NFT description"
            className="form-inputs"
            onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
          />
        </div>
        <div className="mt-7">
          <label className="tracking-wide"> price </label>
          <input
            placeholder="NFT price in ETH"
            className="form-inputs"
            pattern="[+-]?\d+(?:[.,]\d+)?"
            onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
            onKeyPress={(event) => {
              if (!/[0-9]/.test(event.key)) {
                event.preventDefault();
              }
            }}
          />
        </div> 
        <button onClick={createMarket} className="btn-primary mt-7 p-4">
          create NFT
        </button>

        <ToastContainer />
      </div>
    </div>
  )
}