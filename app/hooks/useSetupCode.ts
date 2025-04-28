import { useWalletStatus } from "@frak-labs/react-sdk";
import { useQuery } from "@tanstack/react-query";
import type { GetProductInfoResponseDto } from "./useOnChainShopInfo";

export function useSetupCode({
    shopInfo,
}: {
    shopInfo?: GetProductInfoResponseDto | null;
}) {
    const { data: walletStatus, isLoading: isWalletLoading } =
        useWalletStatus();

    const { data: setupCode, isLoading: isSetupCodeLoading } = useQuery({
        enabled: !shopInfo,
        queryKey: ["mint", "setup-code", walletStatus?.wallet ?? ""],
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
            return setupCode;
        },
    });

    return {
        setupCode,
        isSetupCodeLoading: isSetupCodeLoading || isWalletLoading,
    };
}
