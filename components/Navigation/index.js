import Link from 'next/link';

export default function Navbar() {
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
            {/* changed to button, cause wallet connect should only be a modal instead of redirecting to a connect page right? */}
            <button className='btn-primary'>
              connect
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
