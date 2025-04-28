import { BlockStack, Box, Card, Text } from "@shopify/polaris";
import { useTranslation } from "react-i18next";

type SetupCodeCardProps = {
    setupCode?: string | null;
};

export function SetupCodeCard({ setupCode }: SetupCodeCardProps) {
    const { t } = useTranslation();

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                    {t("status.setupCode.title")}
                </Text>

                <Text as="p" variant="bodyMd">
                    {t("status.setupCode.description")}
                </Text>

                <Box padding="200" background="bg-surface-secondary">
                    <pre>{setupCode}</pre>
                </Box>
            </BlockStack>
        </Card>
    );
}
