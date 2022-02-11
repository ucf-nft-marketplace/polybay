import Link from 'next/link';
import Web3Modal from "web3modal"
import { ethers } from 'ethers'
import { useState } from 'react'
import WalletConnectProvider from "@walletconnect/web3-provider";

export let provider = null;
export let signer = null;

let web3Modal;

export default function Navbar() {
  const [connectionState, setConnectionState] = useState('not-connected')

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          137: "https://rpc-mainnet.maticvigil.com/",
        },
        network: "matic",
      },
    },
  };

  async function retrieveData() {
    web3Modal = new Web3Modal({
      network: 'mainnet', // optional
      cacheProvider: false,
      providerOptions, // required
      disableInjectedProvider: false,
      theme: "dark",
    })

    let connection 

    // catch closing modal error, or canceling account connection
    try {
      connection = await web3Modal.connect()
    } catch(e) {
      return
    }
  
    provider = new ethers.providers.Web3Provider(connection)
    signer = provider.getSigner()
    setConnectionState('connected')
  }

  async function disconnect() {
    await web3Modal.clearCachedProvider()
    setConnectionState('not-connected')
    location.reload()
  }

  if (connectionState === 'not-connected') return (
    <nav className='flex items-center border-b border-gray-400 flex-wrap p-3'>
      <Link href='/'>
        <a className='inline-flex items-center p-2 mr-4 '>
          <span className='text-xl text-white uppercase tracking-wide'>
            Polybay
          </span>
        </a>
      </Link>
      <div className='hidden w-full lg:inline-flex lg:flex-grow lg:w-auto'>
        <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start flex flex-col lg:h-auto'>
          <button className='btn-primary' onClick={retrieveData}>
            connect
          </button>
        </div>
      </div>
    </nav>
  )
  return (
    <>
      <nav className='flex items-center border-b border-gray-400 flex-wrap p-3'>
        <Link href='/'>
          <a className='inline-flex items-center p-2 mr-4 '>
            <span className='text-xl text-white uppercase tracking-wide'>
              Polybay
            </span>
          </a>
        </Link>
        <div className='hidden w-full lg:inline-flex lg:flex-grow lg:w-auto'>
          <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start flex flex-col lg:h-auto'>
            <Link href="/create-item"> 
              <a className='header-links'>
                create
              </a>
            </Link>
            <Link href="/my-assets">
              <a className='header-links'>
                my assets
              </a>
            </Link>
            <Link href="/creator-dashboard">
              <a className='header-links'>
                my dashboard
              </a>
            </Link>
            <button className='btn-primary' onClick={disconnect}>
            disconnect
          </button>
          </div>
        </div>
      </nav>
    </>
  );
};
