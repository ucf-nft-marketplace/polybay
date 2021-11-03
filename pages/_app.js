import '../styles/globals.css'
import Link from 'next/link'
import Navbar from '../components/Navigation'

function MyApp({ Component, pageProps }) {
    return (
        <div>
            <Navbar />
            <Component {...pageProps} />
        </div>
    )
}

export default MyApp
