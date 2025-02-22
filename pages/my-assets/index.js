/* pages/my-assets.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import { Dialog } from '@headlessui/react'

import {
    nftmarketaddress, nftaddress
} from '../../config'

import {
    provider, signer
  } from '../../components/Navigation'

import Market from '../../artifacts/contracts/Market.sol/NFTMarket.json'
import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'

export default function MyAssets() {
    const [nfts, setNfts] = useState([])
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
                description: meta.data.description,
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                nftContract: i.nftContract,
            }
            return item
        }))
        setNfts(items)
        setLoadingState('loaded')
    }

    async function sellNFT(nft) {
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const transaction = await contract.resellToken(nftaddress, nft.tokenId, {
            value: price
        })
        await transaction.wait()
        loadNFTs()
    }

    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">no assets owned</h1>)
    return (
        <div className="flex justify-center">
            <div className="p-4">
                <h2 className="text-2xl py-2 mt-2">my assets</h2>
                <div className="nft-grid">
                    {
                        nfts.map((nft, i) => (
                            <>
                            <div key={i} className="nft-item group">
                                <img src={nft.image} className="h-72 w-full"/>
                                <div className="flex h-20 p-3.5 border rounded-xl rounded-t-none">
                                    <div className="w-4/5">
                                        <p className="text">{nft.name}</p>
                                        <p className="text-xl font-semibold">{nft.price} ETH</p>
                                    </div>
                                    <div className="w-1/5 self-end mr-2">
                                        <button onClick={() => onEnter(i)} className="text-sm hidden focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 group-hover:block">
                                            details
                                        </button>
                                        <button className="text-purple-400 hover:text-purple-700 focus:text-purple-700 outline-0 font-bold bg-transparent text-lg h-7 w-16 p-0" onClick={() => sellNFT(nft)}>Sell</button>
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
                                            <a className="font-medium text-purple-300 text-right" href={"https://mumbai.polygonscan.com/address/" + nft.nftContract}>{nft.nftContract.slice(0,9)}...{nft.nftContract.slice(-9,-1)}</a>
                                            <p className="font-light"> seller address </p>
                                            <a className="font-medium text-purple-300 text-right" href={"https://mumbai.polygonscan.com/address/" + nft.seller}>{nft.seller.slice(0,9)}...{nft.seller.slice(-9,-1)}</a>
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
        </div>
    )
}