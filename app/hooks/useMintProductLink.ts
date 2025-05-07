import { useWalletStatus } from "@frak-labs/react-sdk";
import { useRouteLoaderData } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import type { loader as rootLoader } from "app/routes/app";
import type { GetProductInfoResponseDto } from "./useOnChainShopInfo";

export function useMintProductLink({
    shopInfo,
}: {
    shopInfo?: GetProductInfoResponseDto | null;
}) {
    const { data: walletStatus, isLoading: isWalletLoading } =
        useWalletStatus();
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");

    const { data: link, isLoading: isLinkLoading } = useQuery({
        enabled: !shopInfo,
        queryKey: [
            "mint",
            "setup-link",
            walletStatus?.wallet ?? "",
            rootData?.shop?.myshopifyDomain ?? "",
            rootData?.shop?.name ?? "",
        ],
        queryFn: async () => {
            if (!walletStatus?.wallet) return null;

            const url = `/api/mint?walletAddress=${encodeURIComponent(walletStatus.wallet)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw {
                    error: `HTTP error ${response.status}`,
                    details: await response.text(),
                };
            }

            const setupCode: string = await response.json();

            // Build the url
            const mintUrl = new URL(
                process.env.BUSINESS_URL ?? "https://business.frak.id"
            );
            mintUrl.pathname = "/embedded/mint";
            mintUrl.searchParams.append("sc", setupCode);
            mintUrl.searchParams.append(
                "d",
                rootData?.shop?.myshopifyDomain ?? ""
            );
            mintUrl.searchParams.append("n", rootData?.shop?.name ?? "");
            mintUrl.searchParams.append("pt", "webshop,referral,purchase");

            return mintUrl.toString();
        },
    });

    return {
        link,
        isLinkLoading: isLinkLoading || isWalletLoading,
    };
}
