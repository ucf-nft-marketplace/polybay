import Link from 'next/link';

export default function Navbar() {
  return (
    <>
      <nav className='flex items-center flex-wrap bg-purple-500 p-3 '>
        <Link href='/'>
          <a className='inline-flex items-center p-2 mr-4 '>
            <span className='text-xl text-white font-bold uppercase tracking-wide'>
              Polybay
            </span>
          </a>
        </Link>
        <div className='hidden w-full lg:inline-flex lg:flex-grow lg:w-auto'>
          <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto'>
            <Link href="create-item">
              <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:text-gray-700'>
                Create
              </a>
            </Link>
            <Link href="/my-assets">
              <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:text-gray-700'>
                My Assets
              </a>
            </Link>
            <Link href="/creator-dashboard">
              <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:text-gray-700'>
                My Dashboard
              </a>
            </Link>
            <Link href="/connect-wallet">
              <a className='lg:inline-flex lg:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:text-gray-700'>
                Connect
              </a>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};
