import {
    Badge,
    BlockStack,
    Box,
    Card,
    DescriptionList,
    InlineStack,
    Text,
} from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";
import type { MerchantResolveResponse } from "app/services.server/merchant";
import { useTranslation } from "react-i18next";

export function ConnectedShopInfo({
    merchantInfo,
}: {
    merchantInfo: MerchantResolveResponse;
}) {
    const { t } = useTranslation();

    return (
        <Card>
            <BlockStack gap="400">
                <Box paddingBlockEnd="200">
                    <InlineStack align="space-between">
                        <Text variant="headingMd" as="h2">
                            {t("status.connectedShop.title")}
                        </Text>
                        <Badge tone="success" icon={CheckIcon}>
                            {t("status.connected")}
                        </Badge>
                    </InlineStack>
                </Box>

                <DescriptionList
                    items={[
                        {
                            term: t("status.connectedShop.merchantName"),
                            description: merchantInfo.name,
                        },
                        {
                            term: t("status.connectedShop.domain"),
                            description: merchantInfo.domain,
                        },
                        {
                            term: t("status.connectedShop.merchantId"),
                            description: merchantInfo.merchantId,
                        },
                    ]}
                />

                <Box paddingBlockStart="200">
                    <Text variant="bodyMd" as="p">
                        {t("status.connectedShop.description")}
                    </Text>
                </Box>
            </BlockStack>
        </Card>
    );
}
