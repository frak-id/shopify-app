import type { AuthenticatedContext } from "app/types/context";
import { LRUCache } from "lru-cache";
import type { Hex } from "viem";
import { productIdFromDomain } from "../utils/productIdFromDomain";

type ShopInfoReturnType = {
    id: string;
    name: string;
    url: string;
    myshopifyDomain: string;
    primaryDomain: {
        id: string;
        host: string;
        url: string;
    };
    domain: string;
    normalizedDomain: string;
    productId: Hex;
};

const shopInfoCache = new LRUCache<string, ShopInfoReturnType>({
    max: 512,
    // ttl of 1min
    ttl: 60_000,
});

/**
 * Get the shop name and url
 */
export async function shopInfo({
    admin: { graphql },
    session: { shop: sessionShop },
}: AuthenticatedContext): Promise<ShopInfoReturnType> {
    // Check if we got that in our LRU Cache
    const cachedShopInfo = shopInfoCache.get(sessionShop);
    if (cachedShopInfo) {
        console.debug("Cache hit for shop", sessionShop);
        return cachedShopInfo;
    }
    console.debug("Cache miss for shop", sessionShop);
    // Otherwise, fetch it from the API
    const response = await graphql(`
query shopInfo {
  shop {
    id
    name
    url
    myshopifyDomain
    primaryDomain { id, host, url }
  }
}`);
    const {
        data: { shop },
    } = await response.json();

    // Build our final domain
    const finalDomain = shop.primaryDomain?.host ?? shop.myshopifyDomain;
    const normalizedDomain = finalDomain
        .replace("https://", "")
        .replace("http://", "")
        .replace("www.", "");

    // Build our final object
    const finalShopInfo = {
        ...shop,
        domain: shop.primaryDomain?.host ?? shop.myshopifyDomain,
        normalizedDomain,
        productId: productIdFromDomain(normalizedDomain),
    };

    // Add it to our LRU Cache
    shopInfoCache.set(sessionShop, finalShopInfo);

    return finalShopInfo;
}

export type FirstProductPublishedReturnType = {
    handle: string;
};

/**
 * Get the first product published
 */
export async function firstProductPublished({
    admin: { graphql },
}: AuthenticatedContext): Promise<FirstProductPublishedReturnType> {
    const response = await graphql(`
query GetFirstPublishedProduct {
  products(first: 1, query: "published_status:published") {
    edges {
      node {
        handle
      }
    }
  }
}`);
    const {
        data: { products },
    } = await response.json();

    return products.edges?.[0]?.node;
}
