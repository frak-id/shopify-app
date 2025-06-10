import { BlockStack, Box, Card, Text, TextField } from "@shopify/polaris";
import { useTranslation } from "react-i18next";

const SHARING_FIELD_KEYS = ["sharing.title", "sharing.text"];

const MODAL_FIELD_KEYS = [
    "sdk.wallet.login.text_sharing",
    "sdk.wallet.login.text_referred",
    "sdk.wallet.login.primaryAction",
];

// Sharing Section Component
export function SharingSection({
    values,
    onUpdate,
    language,
}: {
    values: Record<string, string>;
    onUpdate: (key: string, value: string) => void;
    language: string;
}) {
    const { t } = useTranslation();

    return (
        <Card>
            <BlockStack gap="400">
                <Box>
                    <Text as="h4" variant="headingSm">
                        {t("customizations.sharing.title")}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                        {t("customizations.sharing.description")}
                    </Text>
                </Box>
                {SHARING_FIELD_KEYS.map((key) => (
                    <TextField
                        key={`${language}-${key}`}
                        label={t(`customizations.fields.${key}.label`)}
                        helpText={t(`customizations.fields.${key}.description`)}
                        placeholder={t(
                            `customizations.fields.${key}.placeholder`
                        )}
                        value={values[key] || ""}
                        onChange={(value) => onUpdate(key, value)}
                        multiline={key.includes("text")}
                        autoComplete="off"
                    />
                ))}
            </BlockStack>
        </Card>
    );
}

// Modal Section Component
export function ModalSection({
    values,
    onUpdate,
    language,
}: {
    values: Record<string, string>;
    onUpdate: (key: string, value: string) => void;
    language: string;
}) {
    const { t } = useTranslation();
    return (
        <Card>
            <BlockStack gap="400">
                <Box>
                    <Text as="h4" variant="headingSm">
                        {t("customizations.modal.title")}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                        {t("customizations.modal.description")}
                    </Text>
                </Box>
                {MODAL_FIELD_KEYS.map((key) => (
                    <TextField
                        key={`${language}-${key}`}
                        label={t(`customizations.fields.${key}.label`)}
                        helpText={t(`customizations.fields.${key}.description`)}
                        placeholder={t(
                            `customizations.fields.${key}.placeholder`
                        )}
                        value={values[key] || ""}
                        onChange={(value) => onUpdate(key, value)}
                        multiline={true}
                        autoComplete="off"
                    />
                ))}
            </BlockStack>
        </Card>
    );
}
