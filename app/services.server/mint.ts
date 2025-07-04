import { type Address, concatHex, keccak256, toHex } from "viem";
import type { AuthenticatedContext } from "../types/context";
import { shopInfo } from "./shop";

/**
 * Generate a product setup code for a wallet address
 */
export async function getProductSetupCode(
    ctx: AuthenticatedContext,
    walletAddress: Address
) {
    const { normalizedDomain: domain } = await shopInfo(ctx);

    // Generate the setup code
    return keccak256(
        concatHex([
            toHex(domain),
            walletAddress,
            toHex(process.env.PRODUCT_SETUP_CODE_SALT ?? ""),
        ])
    );
}
