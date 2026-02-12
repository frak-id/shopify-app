import { keccak256, toHex } from "viem";
import { describe, expect, it } from "vitest";
import { productIdFromDomain } from "./productIdFromDomain";

describe("productIdFromDomain", () => {
    it("returns keccak256 hash of domain hex", () => {
        const domain = "example.myshopify.com";
        const expected = keccak256(toHex(domain));
        expect(productIdFromDomain(domain)).toBe(expected);
    });

    it("produces different hashes for different domains", () => {
        const a = productIdFromDomain("shop-a.myshopify.com");
        const b = productIdFromDomain("shop-b.myshopify.com");
        expect(a).not.toBe(b);
    });

    it("returns a valid hex string", () => {
        const result = productIdFromDomain("test.com");
        expect(result).toMatch(/^0x[0-9a-f]{64}$/);
    });

    it("is deterministic", () => {
        const domain = "stable.myshopify.com";
        expect(productIdFromDomain(domain)).toBe(productIdFromDomain(domain));
    });
});
