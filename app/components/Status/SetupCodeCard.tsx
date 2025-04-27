import {
    BlockStack,
    Box,
    Button,
    Card,
    Icon,
    InlineStack,
    Text,
    TextField,
    Toast,
} from "@shopify/polaris";
import { ClipboardIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type SetupCodeCardProps = {
    setupCode?: string | null;
};

export function SetupCodeCard({ setupCode }: SetupCodeCardProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (setupCode) {
            navigator.clipboard.writeText(setupCode);
            setCopied(true);

            // Auto-hide toast after 3 seconds
            setTimeout(() => {
                setCopied(false);
            }, 3000);
        }
    };

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
                    <InlineStack align="space-between">
                        <TextField
                            label=""
                            value={setupCode || ""}
                            readOnly
                            autoComplete="off"
                            labelHidden
                            monospaced
                            disabled={!setupCode}
                        />
                        <Box padding="100">
                            <Button
                                icon={<Icon source={ClipboardIcon} />}
                                onClick={handleCopy}
                                disabled={!setupCode}
                                variant="tertiary"
                                accessibilityLabel={t(
                                    "status.setupCode.copyButton"
                                )}
                            />
                        </Box>
                    </InlineStack>
                </Box>
            </BlockStack>

            {copied && (
                <Toast
                    content={t("status.setupCode.copied")}
                    duration={3000}
                    onDismiss={() => setCopied(false)}
                />
            )}
        </Card>
    );
}
