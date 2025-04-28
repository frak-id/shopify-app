import {
    Banner,
    BlockStack,
    Button,
    Card,
    InlineStack,
    Text,
} from "@shopify/polaris";
import { CheckIcon, InfoIcon, RefreshIcon } from "@shopify/polaris-icons";
import { useTranslation } from "react-i18next";

interface StatusBannerProps {
    isConnected: boolean;
    isLoading: boolean;
    refetch: () => void;
}

export function StatusBanner({
    isConnected,
    isLoading,
    refetch,
}: StatusBannerProps) {
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
                <InlineStack gap="100" align="space-between">
                    <Banner tone="warning" icon={InfoIcon}>
                        <BlockStack gap="200">
                            <Text as="p">
                                {t("status.connectionStatus.notConnected")}
                            </Text>
                        </BlockStack>
                    </Banner>

                    <Button
                        icon={RefreshIcon}
                        onClick={refetch}
                        loading={isLoading}
                    />
                </InlineStack>
            </BlockStack>
        </Card>
    );
}
