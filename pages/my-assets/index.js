/* pages/my-assets.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
    nftmarketaddress, nftaddress
} from '../../config'

import {
    provider, signer
  } from '../../components/Navigation'

import Market from '../../artifacts/contracts/Market.sol/NFTMarket.json'
import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'

export default function MyAssets() {
    if (provider === null) return (<p className="py-10 px-20 text-3xl">please connect first</p>)

    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
        loadNFTs()
    }, [])
    async function loadNFTs() {
        const web3Modal = new Web3Modal({
            network: "mainnet",
            cacheProvider: true,
        })

        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await marketContract.fetchMyNFTs()

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
                name: meta.data.name,
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
            }
            return item
        }))
        setNfts(items)
        setLoadingState('loaded')
    }
    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">no assets owned</h1>)
    return (
        <div className="flex justify-center">
            <div className="p-4">
                <h2 className="text-2xl py-2 mt-2">my assets</h2>
                <div className="nft-grid">
                    {
                        nfts.map((nft, i) => (
                            <div key={i} className="nft-item group">
                                <img src={nft.image} className="h-72 w-full"/>
                                <div className="flex h-20 p-3.5 border rounded-xl rounded-t-none">
                                    <div className="w-4/5">
                                        <p className="text">{nft.name}</p>
                                        <p className="text-xl font-semibold">{nft.price} ETH</p>
                                    </div>
                                    <div className="w-1/5 self-end mr-2">
                                        <button className="text-sm hidden focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 group-hover:block">
                                            details
                                        </button>
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