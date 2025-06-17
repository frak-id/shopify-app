import { LRUCache } from "lru-cache";
import type { GetProductInfoResponseDto } from "../hooks/useOnChainShopInfo";
import type { AuthenticatedContext } from "../types/context";
import { indexerApi } from "../utils/indexerApi";
import { shopInfo } from "./shop";

const productInfoCache = new LRUCache<string, GetProductInfoResponseDto>({
    max: 512,
    // TTL of 5 seconds (rly short lived, for multi page navigation basically)
    ttl: 5_000,
});

export async function getOnchainProductInfo(context: AuthenticatedContext) {
    const shop = await shopInfo(context);

    const cachedProductInfo = productInfoCache.get(shop.normalizedDomain);
    if (cachedProductInfo) {
        return cachedProductInfo;
    }

    const productInfo = (await indexerApi
        .get(`products/info?domain=${shop.normalizedDomain}`)
        .json()) as GetProductInfoResponseDto | null;

    if (productInfo) {
        productInfoCache.set(shop.normalizedDomain, productInfo);
    }

    return productInfo;
}

export async function clearOnChainShopCache(context: AuthenticatedContext) {
    const shop = await shopInfo(context);
    productInfoCache.delete(shop.normalizedDomain);
}
