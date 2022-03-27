import Link from 'next/link';
import { useEffect, useState } from 'react'
import { RetrieveData, ClearData } from '../Web3Modal';

export let provider = null;
export let signer = null;

export default function Navbar() {
    
  const [connectionState, setConnectionState] = useState('not-connected')

  // if there's a current account connected via web3, retrieve data from it
  useEffect(async function() {
    if (window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER") != null) {
        const response = await RetrieveData()
        provider = response[0]
        signer = response[1]
        setConnectionState('connected')
    }
  },[]);

  async function setWeb3(){
    const response = await RetrieveData()
    provider = response[0]
    signer = response[1]
    setConnectionState('connected')
    location.reload()
  }
  
  async function disconnect() {
    await ClearData()
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
          <button className='btn-primary' onClick={setWeb3}>
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
