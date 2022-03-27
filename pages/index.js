import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { Dialog } from '@headlessui/react'

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

    const [isShown, setIsShown] = useState(false)
    const [isKey, setKey] = useState(null)

    // [<variable>,<function to set variable>] default state during app startup: 'not loaded'
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
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

    // where we call smart contact and fetch NFTs, function will be called when app/component loads via the useEffect hook
    async function loadNFTs() {
        // use the commented line below to use local network for the backend.
        // const provider = new ethers.providers.JsonRpcProvider()
        const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today")
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
                nftContract: i.nftContract,
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
    
    if (loadingState == 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">no NFT's currently for sale</h1>)
    return (
        <div className="flex justify-center">
            <div className="px-4">
                <h2 className="text-2xl py-2 mt-2">all NFT's for sale</h2>
                <div className="nft-grid">
                    {
                        nfts.map((nft, i) => (
                            <>
                            <div key={i} className="nft-item group">
                                <img src={nft.image} className="h-72 w-full"/>
                                <div className="flex h-20 p-3.5 border rounded-xl rounded-t-none">
                                    <div className="w-3/4">
                                    <p className="text">{nft.name}</p>
                                    <p className="text-xl font-semibold">{nft.price} ETH</p>
                                    </div>
                                    <div className="w-1/5 self-end justify-right">
                                        <button onClick={() => onEnter(i)} className="text-sm hidden focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 group-hover:block">
                                            details
                                        </button>
                                        <button className="text-purple-400 hover:text-purple-700 focus:text-purple-700 outline-0 font-bold bg-transparent text-lg h-7 w-16 p-0" onClick={() => buyNft(nft)}>Buy</button>
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
        </div>
    )
}