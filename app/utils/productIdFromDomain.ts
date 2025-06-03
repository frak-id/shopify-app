import { keccak256, toHex } from "viem";

/**
 * Get product id from shopify domain
 * @param domain
 * @returns
 */
export function productIdFromDomain(domain: string) {
    return keccak256(toHex(domain));
}
