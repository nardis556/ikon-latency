import * as idex from "@idexio/idex-sdk"
import clientConfig from "./src/config"
import { v1 as uuidv1 } from "uuid"
import fs from 'fs'

const client = new idex.RestAuthenticatedClient({
    baseURL: clientConfig.baseUrl,
    walletPrivateKey: clientConfig.walletPrivateKey,
    apiKey: clientConfig.apiKey,
    apiSecret: clientConfig.apiSecret,
    chainId: Number(clientConfig.chainId),
    exchangeContractAddress: clientConfig.exchangeContractAddress,
    sandbox: clientConfig.sandbox,
})

const testMethod = "associateWallet"
const testMethodParams = {
    wallet: clientConfig.walletAddress,
    nonce: uuidv1(),
}

const method = "createOrder"
const methodParams: idex.RestRequestOrderOfType<typeof idex.OrderType.limit> = {
    type: idex.OrderType.limit,
    wallet: clientConfig.walletAddress,
    nonce: uuidv1(),
    market: "ETH-USD",
    side: idex.OrderSide.buy,
    quantity: "0.05000000",
    price: "2200.00000000",
    timeInForce: "fok",
    selfTradePrevention: "cn"
}

function parseTimeString(time: string): number {
    const value = parseInt(time.slice(0, -1))
    const unit = time.slice(-1)
    switch (unit) {
        case 's': return value * 1000
        case 'm': return value * 60 * 1000
        case 'h': return value * 60 * 60 * 1000
        default: throw new Error('Invalid time unit. Use s/m/h')
    }
}

async function measureLatency() {
    const start = Date.now()
    try {
        const orderParams = {
            ...methodParams,
            nonce: uuidv1()
        }
        await client.createOrder(orderParams)
        return Date.now() - start
    } catch (error) {
        console.error('Order creation failed:', error)
        throw error
    }
}

async function runLatencyTest(interval: string, duration: string) {
    try {
        console.log(`Running initial ${testMethod}...`)
        await client[testMethod](testMethodParams)
        console.log(`${testMethod} completed successfully`)
    } catch (error) {
        console.error(`${testMethod} failed:`, error)
        return
    }

    try {
        console.log(`Running initial ${method}...`)
        await client[method](methodParams)
        console.log(`${method} completed successfully`)
    } catch (error) {
        console.error(`${method} failed:`, error)
        return
    }

    const intervalMs = parseTimeString(interval)
    const durationMs = parseTimeString(duration)
    const endTime = Date.now() + durationMs

    const env = "prod"
    const logDir = `logs/${env}`
    
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }

    const logFile = `${logDir}/latency_${new Date().toISOString().replace(/[:.]/g, '-')}.log`

    while (Date.now() < endTime) {
        try {
            const latency = await measureLatency()
            const timestamp = new Date().toISOString()
            const logEntry = `${timestamp},${latency}ms\n`

            fs.appendFileSync(logFile, logEntry)
            console.log(`Latency: ${latency}ms`)
        } catch (error) {
            console.log('Skipping this iteration due to error')
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
}

// Usage example: runLatencyTest('1m', '30m')
runLatencyTest('1m', '30m')

//test