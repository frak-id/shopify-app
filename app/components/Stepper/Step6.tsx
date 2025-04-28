import { BlockStack, Box, Spinner } from "@shopify/polaris";
import { useOnChainShopInfo } from "app/hooks/useOnChainShopInfo";
import { useSetupCode } from "app/hooks/useSetupCode";
import { ConnectedShopInfo } from "../Status/ConnectedShopInfo";
import { SetupCodeCard } from "../Status/SetupCodeCard";
import { SetupInstructions } from "../Status/SetupInstructions";
import { StatusBanner } from "../Status/StatusBanner";

export function Step6() {
    const {
        shopInfo,
        isLoading: isShopInfoLoading,
        refetch: refetchShopInfo,
    } = useOnChainShopInfo();
    const { setupCode, isSetupCodeLoading } = useSetupCode({
        shopInfo,
    });

    // Check loading state for all queries
    const isLoading = isShopInfoLoading || isSetupCodeLoading;

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
                    <>
                        <SetupCodeCard setupCode={setupCode} />
                        <SetupInstructions setupCode={setupCode} />
                    </>
                )}
            </BlockStack>
        </Box>
    );
}
