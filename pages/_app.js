import '../styles/globals.css'
import Navbar from '../components/Navigation'

function MyApp({ Component, pageProps }) {
    return (
        <div className="bg-black h-full min-h-screen text-white font-body">
            <Navbar />
            <Component {...pageProps} />
        </div>
    )
}

export default MyApp
