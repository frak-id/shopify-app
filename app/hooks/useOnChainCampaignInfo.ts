import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { multicall } from "viem/actions";
import {
    interactionCampaignAbi,
    referralCampaignAbi,
} from "../utils/abis/campaignAbis";
import { viemClient } from "../utils/viemClient";

export function useOnChainCampaignInfo(address: Address) {
    return useQuery({
        queryKey: ["campaign", address],
        queryFn: async () => {
            // Fetch a few generic onchain information
            const [metadata, isActive, isRunning, config] = await multicall(
                viemClient,
                {
                    contracts: [
                        {
                            abi: interactionCampaignAbi,
                            address: address,
                            functionName: "getMetadata",
                            args: [],
                        } as const,
                        {
                            abi: interactionCampaignAbi,
                            address: address,
                            functionName: "isActive",
                            args: [],
                        } as const,
                        {
                            abi: interactionCampaignAbi,
                            address: address,
                            functionName: "isRunning",
                            args: [],
                        } as const,
                        {
                            abi: referralCampaignAbi,
                            address: address,
                            functionName: "getConfig",
                            args: [],
                        } as const,
                    ],
                    allowFailure: false,
                }
            );

            return {
                metadata,
                isActive,
                isRunning,
                config,
            };
        },
    });
}
