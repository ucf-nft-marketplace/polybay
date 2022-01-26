import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
    nftaddress, nftmarketaddress
} from '../config'

// ABI's - how the ethers client will know how to interact with the contract
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'


export default function Home() {
    // [<empty array of NFTs>, <function to reset array>]
    // procedure: app loads (with no NFTs) -> call to smart contract that fetches the array -> update local state
    // used for show/hiding UI
    const [nfts, setNfts] = useState([])

    // [<variable>,<function to set variable>] default state during app startup: 'not loaded'
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadNFTs()
    }, [])

    // where we call smart contact and fetch NFTs, function will be called when app/component loads via the useEffect hook
    async function loadNFTs() {
        const provider = new ethers.providers.JsonRpcProvider()
        // ref to NFT contract
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
        // returns array of all unsold market items
        const data = await marketContract.fetchMarketItems()

        const items = await Promise.all(data.map(async i => {
            // will use to get metadata from the token
            // IPFS will use this information (name, description, image ref) to upload a json representation of the NFT
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
            }
            return item
        }))
        // set new updated items array
        setNfts(items)
        setLoadingState('loaded')
    }

    async function buyNft(nft) {
        // looking for instance of the etherum being injected into the web browser
        const web3Modal = new Web3Modal()
        // if user is connected will populate this
        const connection = await web3Modal.connect()
        // create provider using users connection
        const provider = new ethers.providers.Web3Provider(connection)

        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

        // gets price of nft in a format we can use
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

        const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
            value: price
        })
        await transaction.wait()
        // this should return a new array of NFTs (one less) due to sale
        loadNFTs()
    }
    
    if (loadingState == 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in the marketplace</h1>)
    return (
        <div className="flex justify-center">
            <div className="px-4">
                <h2 className="text-2xl py-2 mt-2">all NFT's for sale</h2>
                <div className="nft-grid">
                    {
                        nfts.map((nft, i) => (
                            <div key={i} className="nft-item">
                                <img src={nft.image} className="h-72 w-full"/>
                                <div className="flex h-20 p-3.5 border rounded-xl rounded-t-none">
                                    <div className="w-3/4">
                                    <p className="text">{nft.name}</p>
                                    <p className="text-xl font-semibold">{nft.price} ETH</p>
                                    </div>
                                    <div className="w-1/5 self-end justify-right">
                                        <button className="text-purple-400 hover:text-purple-700 focus:text-purple-700 outline-0 font-bold bg-transparent text-lg h-7 w-16 p-0" onClick={() => buyNft(nft)}>Buy</button>
                                    </div>
                                </div>
                            </div>
                      ))
                    }
                </div>
            </div>
        </div>
    )
}