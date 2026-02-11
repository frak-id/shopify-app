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
import { useTranslation } from "react-i18next";

type ConnectedShopInfoProps = {
    product: {
        name: string;
        createTimestamp: string;
    };
};

export function ConnectedShopInfo({ product }: ConnectedShopInfoProps) {
    const { t } = useTranslation();

    // Convert Unix timestamp (seconds) to a human-readable date
    const formatDate = (unixTimestamp: string) => {
        const date = new Date(Number.parseInt(unixTimestamp, 10) * 1000);
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

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
                            term: t("status.connectedShop.productName"),
                            description: product.name,
                        },
                        {
                            term: t("status.connectedShop.createdOn"),
                            description: formatDate(product.createTimestamp),
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
