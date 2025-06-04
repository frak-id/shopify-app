import { useRouteLoaderData } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import type { loader as rootLoader } from "app/routes/app";
import type { Address } from "viem";
import { indexerApi } from "../utils/indexerApi";

export function useOnChainShopInfo() {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");

    const {
        data: shopInfo,
        isLoading,
        refetch,
    } = useQuery({
        enabled: !!rootData?.shop.normalizedDomain,
        queryKey: ["shopInfo", rootData?.shop.normalizedDomain],
        queryFn: async () => {
            try {
                return (await indexerApi
                    .get(
                        `products/info?domain=${rootData?.shop.normalizedDomain}`
                    )
                    .json()) as GetProductInfoResponseDto | null;
            } catch (e) {
                console.warn("Error fetching shop info", e);
                return null;
            }
        },
        refetchOnWindowFocus: true,
        // Refetch every 30 seconds
        refetchInterval: 30_000,
    });

    return { shopInfo, isLoading, refetch };
}

export type GetProductInfoResponseDto = {
    product: {
        id: string;
        domain: string;
        productTypes: string;
        name: string;
        createTimestamp: string;
        lastUpdateTimestamp: string | null;
        lastUpdateBlock: string;
        metadataUrl: string;
    };
    banks: {
        id: Address;
        tokenId: Address;
        productId: string;
        totalDistributed: string;
        totalClaimed: string;
        isDistributing: boolean;
    }[];
    interactionContracts: {
        id: Address;
        productId: string;
        referralTree: string;
        lastUpdateBlock: string;
        createdTimestamp: string;
        lastUpdateTimestamp: string;
        removedTimestamp: string | null;
    }[];
    administrators: {
        productId: string;
        isOwner: boolean;
        roles: string;
        user: string;
        createdTimestamp: string;
    }[];
    campaigns: {
        id: Address;
        type: string;
        name: string;
        version: string;
        productId: string;
        interactionContractId: string;
        attached: boolean;
        lastUpdateBlock: string;
        attachTimestamp: string;
        detachTimestamp: string | null;
        bankingContractId: Address;
        isAuthorisedOnBanking: boolean;
    }[];
    campaignStats: {
        campaignId: Address;
        totalInteractions: string;
        openInteractions: string;
        readInteractions: string;
        referredInteractions: string;
        createReferredLinkInteractions: string;
        purchaseStartedInteractions: string;
        purchaseCompletedInteractions: string;
        webshopOpenned: string;
        customerMeetingInteractions: string;
        totalRewards: string;
        rewardCount: string;
    }[];
};
