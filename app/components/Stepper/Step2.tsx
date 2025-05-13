import { BlockStack, Box, Spinner } from "@shopify/polaris";
import { useOnChainShopInfo } from "app/hooks/useOnChainShopInfo";
import { ConnectedShopInfo } from "../Status/ConnectedShopInfo";
import { SetupInstructions } from "../Status/SetupInstructions";
import { StatusBanner } from "../Status/StatusBanner";

export function Step2() {
    const {
        shopInfo,
        isLoading: isShopInfoLoading,
        refetch: refetchShopInfo,
    } = useOnChainShopInfo();

    // Check loading state for all queries
    const isLoading = isShopInfoLoading;

    if (isLoading) {
        return (
            <Box padding={"600"}>
                <BlockStack gap="400" align="center">
                    <Spinner size="large" />
                </BlockStack>
            </Box>
        );
    }

    return (
        <Box padding={"600"}>
            <BlockStack gap="400" align="center">
                <StatusBanner
                    isConnected={!!shopInfo}
                    isLoading={isLoading}
                    refetch={refetchShopInfo}
                />

                {shopInfo ? (
                    <ConnectedShopInfo product={shopInfo.product} />
                ) : (
                    <SetupInstructions />
                )}
            </BlockStack>
        </Box>
    );
}
