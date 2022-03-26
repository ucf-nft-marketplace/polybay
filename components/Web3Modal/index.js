import Web3Modal from "web3modal"
import { ethers } from 'ethers'
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

let web3Modal;

export async function RetrieveData() {
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
        walletlink: {
            package: CoinbaseWalletSDK, 
            options: {
                appName: "Polybay",
                rpc: {
                    137: "https://rpc-mainnet.maticvigil.com/",
                },
                network: "matic",
            },
        }
    }

    web3Modal = new Web3Modal({
        network: 'mainnet', // optional
        cacheProvider: true,
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

    let provider = new ethers.providers.Web3Provider(connection)
    let signer = provider.getSigner()

    return [provider, signer]
}

export async function ClearData() {
    await web3Modal.clearCachedProvider()
}
