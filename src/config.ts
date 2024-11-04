import { Wallet } from "ethers"
import * as dotenv from 'dotenv'

dotenv.config()

const clientConfig = {
    baseUrl: process.env.BASE_URL,
    exchangeContractAddress: process.env.EXCHANGE_CONTRACT_ADDRESS,
    chainId: process.env.CHAIN_ID,
    walletPrivateKey: process.env.WALLET_PRIVATE_KEY!,
    sandbox: process.env.SANDBOX === "true",
    apiKey: process.env.API_KEY!,
    apiSecret: process.env.API_SECRET!,
    walletAddress: new Wallet(process.env.WALLET_PRIVATE_KEY!).address,
}

export default clientConfig
