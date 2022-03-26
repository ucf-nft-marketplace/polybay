import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Dialog } from '@headlessui/react'

import {
  nftmarketaddress, nftaddress
} from '../../config'

import {
  provider, signer
} from '../../components/Navigation'

import Market from '../../artifacts/contracts/Market.sol/NFTMarket.json'
import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'

export default function CreatorDashboard() {

  // creator - created nfts
  const [nfts, setNfts] = useState([])
  // creator - sold nfts
  const [sold, setSold] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  const [isShown, setIsShown] = useState(false)
  const [isKey, setKey] = useState(null)

  useEffect(() => {
    if (provider === null) return (<p className="py-10 px-20 text-3xl">please connect first</p>)
    loadNFTs()
  }, [])

  function onEnter(key) {
    setIsShown(true)
    setKey(key)
  }

  function onLeave() {
    setIsShown(false)
    setKey(null)
  }

  // checks current key with selected key, so that the correct nft is displayed 
  function checkKey(isShown, key, i) {
    if ((isShown) && (key === i) ){
      return true
    }
    return false
  }

  async function loadNFTs() {
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

    // returns the items that match the address of the user received from marketcontract
    const data = await marketContract.fetchItemsCreated()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        name: meta.data.name,
        description: meta.data.description,
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        sold: i.sold,
        image: meta.data.image,
      }
      return item
    }))
    // create a filtered array of items that have been sold
    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNfts(items)
    setLoadingState('loaded')
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">no assets created</h1>)
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">items created</h2>
          <div className="nft-grid">
          {
            nfts.map((nft, i) => (
              <>           
              <div key={i} className="nft-item group">
                <img src={nft.image} className="h-72 w-full" />
                <div className="flex h-20 p-3.5 border rounded-xl rounded-t-none">
                  <div className="w-4/5">
                    <p className="text">{nft.name}</p>
                    <p className="text-xl font-semibold">{nft.price} ETH</p>
                  </div>
                  <div className="w-1/5 self-end mr-2">
                    <button onClick={() => onEnter(i)} className="text-sm hidden focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 group-hover:block">
                      details
                    </button>
                  </div>
                </div>
              </div>
              <Dialog className="fixed inset-0 z-10 overflow-y-auto" open={checkKey(isShown, isKey, i)} onClose={() => onLeave()} >
                  <div className="min-h-screen px-4 text-center">
                    {/* handle clicking outside of dialog */}
                    <Dialog.Overlay className="fixed inset-0" />
                    {/* centers dialog to screen */}
                    <span className="inline-block h-screen align-middle" aria-hidden="true">
                      &#8203;
                    </span>
                      <div className="inline-block w-full max-w-md p-6 my-8 border overflow-hidden text-left align-middle transform bg-black rounded-2xl">
                        <Dialog.Title className="text-lg font-medium leading-6 text-white">
                          {nft.name}
                        </Dialog.Title>
                        <div className="mt-2 text-white">
                          <img src={nft.image}/>
                          <div className="mt-2 text-sm">
                            <p> {nft.description} </p>
                          </div>
                          <div className="mt-2 text-sm grid grid-cols-2">
                              <p className="font-light"> contract address </p>
                              <a className="font-medium text-purple-300 text-right" href="https://mumbai.polygonscan.com/address/0xc9ad4e81bbcff8b642ed55adb5da7f383442e351">0xc9ad4e81...3442e351</a>
                              <p className="font-light"> token ID </p>
                              <p className="font-medium text-gray-400 text-right"> {nft.tokenId} </p>
                          </div>
                        </div>
                      </div>
                  </div>
                </Dialog>
              </>
            ))
          }
        </div>
      </div>
        <div className="px-4">
        {
          Boolean(sold.length) && (
            <div>
              <h2 className="text-2xl py-2">items sold</h2>
              <div className="nft-grid">
                {
                  sold.map((nft, i) => (
                    <>
                    <div key={i} className="nft-item group">
                      <img src={nft.image} className="h-72 w-full" />
                      <div className="flex h-20 p-3.5 border rounded-xl rounded-t-none">
                        <div className="w-4/5">
                          <p className="text">{nft.name}</p>
                          <p className="text-xl font-semibold">{nft.price} ETH</p>
                        </div>
                        <div className="w-1/5 self-end mr-2">
                          <button onClick={() => onEnter(i)} className="text-sm hidden focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 group-hover:block">
                            details
                          </button>
                        </div>
                      </div>
                    </div>
                    <Dialog className="fixed inset-0 z-10 overflow-y-auto" open={checkKey(isShown, isKey, i)} onClose={() => onLeave()} >
                      <div className="min-h-screen px-4 text-center">
                        {/* handle clicking outside of dialog */}
                        <Dialog.Overlay className="fixed inset-0" />
                        {/* centers dialog to screen */}
                        <span className="inline-block h-screen align-middle" aria-hidden="true">
                          &#8203;
                        </span>
                          <div className="inline-block w-full max-w-md p-6 my-8 border overflow-hidden text-left align-middle transform bg-black rounded-2xl">
                            <Dialog.Title className="text-lg font-medium leading-6 text-white">
                              {nft.name}
                            </Dialog.Title>
                            <div className="mt-2 text-white">
                              <img src={nft.image}/>
                              <div className="mt-2 text-sm">
                                <p> {nft.description} </p>
                              </div>
                              <div className="mt-2 text-sm grid grid-cols-2">
                                  <p className="font-light"> contract address </p>
                                  <a className="font-medium text-purple-300 text-right" href="https://mumbai.polygonscan.com/address/0xc9ad4e81bbcff8b642ed55adb5da7f383442e351">0xc9ad4e81...3442e351</a>
                                  <p className="font-light"> token ID </p>
                                  <p className="font-medium text-gray-400 text-right"> {nft.tokenId} </p>
                              </div>
                            </div>
                          </div>
                      </div>
                    </Dialog>
                    </>
                  ))
                }
              </div>
            </div>
          )
        }
        </div>
    </div>
  )
}