import { Badge, Banner, BlockStack, Card, Text } from "@shopify/polaris";
import { CheckIcon, InfoIcon, XSmallIcon } from "@shopify/polaris-icons";
import { useTranslation } from "react-i18next";

interface StatusBannerProps {
    isConnected: boolean;
    isLoading: boolean;
}

export function StatusBanner({ isConnected, isLoading }: StatusBannerProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <Card>
                <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                        {t("status.connectionStatus.loading")}
                    </Text>
                    <Banner tone="info" icon={InfoIcon}>
                        <Text as="p">
                            {t("status.connectionStatus.checking")}
                        </Text>
                    </Banner>
                </BlockStack>
            </Card>
        );
    }

    if (isConnected) {
        return (
            <Card>
                <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                        {t("status.connectionStatus.title")}
                    </Text>
                    <Banner tone="success" icon={CheckIcon}>
                        <BlockStack gap="200">
                            <Badge tone="success" icon={CheckIcon}>
                                {t("status.connected")}
                            </Badge>
                            <Text as="p">
                                {t("status.connectionStatus.connected")}
                            </Text>
                        </BlockStack>
                    </Banner>
                </BlockStack>
            </Card>
        );
    }

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                    {t("status.connectionStatus.title")}
                </Text>
                <Banner tone="warning" icon={InfoIcon}>
                    <BlockStack gap="200">
                        <Badge tone="critical" icon={XSmallIcon}>
                            {t("status.notConnected")}
                        </Badge>
                        <Text as="p">
                            {t("status.connectionStatus.notConnected")}
                        </Text>
                    </BlockStack>
                </Banner>
            </BlockStack>
        </Card>
    );
}
