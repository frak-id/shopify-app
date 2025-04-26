import type { LoaderFunctionArgs } from "@remix-run/node";
import { isAddress } from "viem";
import { getProductSetupCode } from "../services.server/mint";
import { authenticate } from "../shopify.server";

export async function loader({
    request,
}: LoaderFunctionArgs): Promise<Response> {
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get("walletAddress");

    // Extract the wallet address from the request
    if (!walletAddress) {
        return Response.json("Missing wallet address", { status: 400 });
    }

    if (!isAddress(walletAddress)) {
        return Response.json("Invalid wallet address", { status: 400 });
    }

    // Authenticate the request
    const context = await authenticate.admin(request);

    try {
        // Delegate the core logic (including auth) to the service function
        const data = await getProductSetupCode(context, walletAddress);
        return Response.json(data);
    } catch (error) {
        console.error(`API Route Error (/api/wallet-data): ${error}`);
        return Response.json("Error", { status: 500 });
    }
}
