import { describe, expect, it } from "vitest";
import { productIdFromDomain } from "../utils/productIdFromDomain";
import { normalizeDomain, normalizePreferredCurrency } from "./shop";

describe("domain normalization", () => {
    it("uses primaryDomain.host when available", () => {
        expect(normalizeDomain("shop.example.com", "shop.myshopify.com")).toBe(
            "shop.example.com"
        );
    });

    it("falls back to myshopifyDomain when primary is undefined", () => {
        expect(normalizeDomain(undefined, "shop.myshopify.com")).toBe(
            "shop.myshopify.com"
        );
    });

    it("strips https://", () => {
        expect(
            normalizeDomain("https://shop.example.com", "x.myshopify.com")
        ).toBe("shop.example.com");
    });

    it("strips http://", () => {
        expect(
            normalizeDomain("http://shop.example.com", "x.myshopify.com")
        ).toBe("shop.example.com");
    });

    it("strips www.", () => {
        expect(normalizeDomain("www.shop.example.com", "x.myshopify.com")).toBe(
            "shop.example.com"
        );
    });

    it("strips both https:// and www.", () => {
        expect(
            normalizeDomain("https://www.shop.example.com", "x.myshopify.com")
        ).toBe("shop.example.com");
    });

    it("handles already clean domain", () => {
        expect(normalizeDomain("shop.example.com", "x.myshopify.com")).toBe(
            "shop.example.com"
        );
    });
});

describe("currency normalization", () => {
    it("accepts USD", () => {
        expect(normalizePreferredCurrency("USD")).toBe("usd");
    });

    it("accepts EUR", () => {
        expect(normalizePreferredCurrency("EUR")).toBe("eur");
    });

    it("accepts GBP", () => {
        expect(normalizePreferredCurrency("GBP")).toBe("gbp");
    });

    it("falls back to usd for unsupported currency", () => {
        expect(normalizePreferredCurrency("CAD")).toBe("usd");
    });

    it("falls back to usd when undefined", () => {
        expect(normalizePreferredCurrency(undefined)).toBe("usd");
    });

    it("falls back to usd for JPY", () => {
        expect(normalizePreferredCurrency("JPY")).toBe("usd");
    });
});

describe("productId derivation from normalized domain", () => {
    it("produces consistent productId from domain", () => {
        const domain = "shop.example.com";
        const id1 = productIdFromDomain(domain);
        const id2 = productIdFromDomain(domain);
        expect(id1).toBe(id2);
    });

    it("different domains produce different productIds", () => {
        const id1 = productIdFromDomain("shop-a.example.com");
        const id2 = productIdFromDomain("shop-b.example.com");
        expect(id1).not.toBe(id2);
    });
});
