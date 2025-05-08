import { http, createClient } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";

const chain = process.env.STAGE === "production" ? arbitrum : arbitrumSepolia;

export const viemClient = createClient({
    transport: http(
        `https://erpc.gcp.frak.id/nexus-rpc/evm/${chain.id}?token=${process.env.RPC_SECRET}`,
        {
            batch: {
                wait: 50,
            },
            retryCount: 1,
            retryDelay: 300,
            timeout: 30_000,
        }
    ),
    chain,
});
