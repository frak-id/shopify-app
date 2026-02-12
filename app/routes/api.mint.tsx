import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { isAddress } from "viem";
import { getProductSetupCode } from "../services.server/mint";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get("walletAddress");

    // Extract the wallet address from the request
    if (!walletAddress) {
        return data("Missing wallet address", { status: 400 });
    }

    if (!isAddress(walletAddress)) {
        return data("Invalid wallet address", { status: 400 });
    }

    // Authenticate the request
    const context = await authenticate.admin(request);

    try {
        // Delegate the core logic (including auth) to the service function
        const result = await getProductSetupCode(context, walletAddress);
        return data(result);
    } catch (error) {
        console.error(`API Route Error (/api/wallet-data): ${error}`);
        return data("Error", { status: 500 });
    }
}
