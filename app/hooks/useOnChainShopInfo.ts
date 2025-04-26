import { useRouteLoaderData } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import type { loader as rootLoader } from "app/routes/app";
import { indexerApi } from "../utils/indexerApi";

export function useOnChainShopInfo() {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");

    const { data: shopInfo, isLoading } = useQuery({
        enabled: !!rootData?.shop.myshopifyDomain,
        queryKey: ["shopInfo"],
        queryFn: async () => {
            try {
                return (await indexerApi
                    .get(
                        `products/info?domain=${rootData?.shop.myshopifyDomain}`
                    )
                    .json()) as { test: string } | null;
            } catch (e) {
                console.warn("Error fetching shop info", e);
                return null;
            }
        },
    });

    return { shopInfo, isLoading };
}
