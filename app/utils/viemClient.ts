import { createClient, http } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";

const chain = process.env.STAGE === "production" ? arbitrum : arbitrumSepolia;
const baseUrl =
    process.env.STAGE === "production"
        ? "https://erpc.gcp.frak.id/nexus-rpc/evm"
        : "https://erpc.gcp-dev.frak.id/nexus-rpc/evm";

export const viemClient = createClient({
    transport: http(`${baseUrl}/${chain.id}?token=${process.env.RPC_SECRET}`, {
        batch: {
            wait: 50,
        },
        retryCount: 1,
        retryDelay: 300,
        timeout: 30_000,
    }),
    chain,
});
