import type { LoaderFunctionArgs } from "@remix-run/node";
import { startupPurchase } from "../services.server/purchase";
import { authenticate } from "../shopify.server";

export async function loader({
    request,
}: LoaderFunctionArgs): Promise<Response> {
    const url = new URL(request.url);
    const amount = url.searchParams.get("amount") ?? "";
    const bank = url.searchParams.get("bank") ?? "";

    // Authenticate the request
    const context = await authenticate.admin(request);

    try {
        // Delegate the core logic (including auth) to the service function
        const data = await startupPurchase(context, { amount, bank });
        return Response.json(data);
    } catch (error) {
        console.error(`API Route Error (/api/wallet-data): ${error}`);
        return Response.json("Error", { status: 500 });
    }
}
