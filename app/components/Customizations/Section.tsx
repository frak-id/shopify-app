import { BlockStack, Box, Card, Grid, Text, TextField } from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import { ModalPreview } from "../ModalPreview";
import { SocialPreview } from "../SocialPreview";

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
        <>
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
                            helpText={t(
                                `customizations.fields.${key}.description`
                            )}
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
            <SocialPreviewSection
                title={t("customizations.preview.social.title")}
                description={t("customizations.preview.social.description")}
                sharingTitle={values["sharing.title"]}
                sharingText={values["sharing.text"]}
            />
        </>
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
        <>
            <Card>
                <BlockStack gap="300">
                    <Box>
                        <Text as="h4" variant="headingSm">
                            {t("customizations.modal.formatting.title")}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                            {t("customizations.modal.formatting.description")}
                        </Text>
                    </Box>
                    <BlockStack gap="200">
                        <Box>
                            <Text as="p" variant="bodySm">
                                • {t("customizations.modal.formatting.bold")}
                            </Text>
                        </Box>
                        <Box>
                            <Text as="p" variant="bodySm">
                                • {t("customizations.modal.formatting.italic")}
                            </Text>
                        </Box>
                        <Box>
                            <Text as="p" variant="bodySm">
                                •{" "}
                                {t("customizations.modal.formatting.variable")}
                            </Text>
                        </Box>
                        <Box>
                            <Text as="p" variant="bodySm" tone="subdued">
                                • {t("customizations.modal.formatting.preview")}
                            </Text>
                        </Box>
                    </BlockStack>
                </BlockStack>
            </Card>
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
                            helpText={t(
                                `customizations.fields.${key}.description`
                            )}
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
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                    <ModalPreviewSection
                        title={t("customizations.preview.sharing.title")}
                        description={t(
                            "customizations.preview.sharing.description"
                        )}
                        text={handleValue(
                            values["sdk.wallet.login.text_sharing"],
                            t("customizations.preview.sharing.placeholder")
                        )}
                        button={handleValue(
                            values["sdk.wallet.login.primaryAction"],
                            t("customizations.preview.sharing.button")
                        )}
                    />
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                    <ModalPreviewSection
                        title={t("customizations.preview.referred.title")}
                        description={t(
                            "customizations.preview.referred.description"
                        )}
                        text={handleValue(
                            values["sdk.wallet.login.text_referred"],
                            t("customizations.preview.referred.placeholder")
                        )}
                        button={handleValue(
                            values["sdk.wallet.login.primaryAction"],
                            t("customizations.preview.referred.button")
                        )}
                    />
                </Grid.Cell>
            </Grid>
        </>
    );
}

type ModalPreviewSectionProps = {
    title?: string;
    description?: string;
    text?: string;
    button?: string;
};

export function ModalPreviewSection({
    title,
    description,
    text,
    button,
}: ModalPreviewSectionProps) {
    return (
        <Card>
            <BlockStack gap="400">
                <Box>
                    <Text as="h4" variant="headingSm">
                        {title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                        {description}
                    </Text>
                </Box>
                <ModalPreview text={text} button={button} />
            </BlockStack>
        </Card>
    );
}

type SocialPreviewSectionProps = {
    title: string;
    description: string;
    sharingTitle: string;
    sharingText: string;
};

export function SocialPreviewSection({
    title,
    description,
    sharingTitle,
    sharingText,
}: SocialPreviewSectionProps) {
    const { t } = useTranslation();

    return (
        <Card>
            <BlockStack gap="400">
                <Box>
                    <Text as="h4" variant="headingSm">
                        {title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                        {description}
                    </Text>
                </Box>
                <SocialPreview
                    title={handleValue(
                        sharingTitle,
                        t("customizations.preview.social.title")
                    )}
                    text={handleValue(
                        sharingText,
                        t("customizations.preview.social.description")
                    )}
                />
            </BlockStack>
        </Card>
    );
}

/**
 * Handle the value of the field.
 * If the value is not empty, return the value.
 * If the value is empty, return the default value.
 * @param value - The value of the field.
 * @param defaultValue - The default value of the field.
 * @returns The value of the field.
 */
function handleValue(value: string, defaultValue: string) {
    if (value && value !== "") {
        return value;
    }
    return defaultValue;
}
