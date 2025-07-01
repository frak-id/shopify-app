import { BlockStack, Card, Text, TextField } from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import type { I18nCustomizations } from "../../services.server/metafields";
import { ModalSection, SharingSection } from "./Section";

// Single Language Fields Component
export function SingleLanguageFields({
    customizations,
    onUpdate,
}: {
    customizations: I18nCustomizations;
    onUpdate: (key: string, value: string) => void;
}) {
    // Use 'en' as the default language for single mode and merge logoUrl if provided
    const currentValues = {
        ...(customizations.en || {}),
        ...(customizations.logoUrl ? { logoUrl: customizations.logoUrl } : {}),
    };

    return (
        <BlockStack gap="500">
            <ModalSection
                values={currentValues}
                onUpdate={onUpdate}
                language="single"
            />
            <SharingSection
                values={currentValues}
                onUpdate={onUpdate}
                language="single"
            />
        </BlockStack>
    );
}
// Multi Language Fields Component
export function MultiLanguageFields({
    customizations,
    onUpdate,
}: {
    customizations: I18nCustomizations;
    onUpdate: (language: "fr" | "en", key: string, value: string) => void;
}) {
    // Merge logoUrl into per-language values so the preview can access it
    const frValues = {
        ...(customizations.fr || {}),
        ...(customizations.logoUrl ? { logoUrl: customizations.logoUrl } : {}),
    };
    const enValues = {
        ...(customizations.en || {}),
        ...(customizations.logoUrl ? { logoUrl: customizations.logoUrl } : {}),
    };

    return (
        <BlockStack gap="500">
            {/* French */}
            <Card>
                <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                        French (Français)
                    </Text>
                    <ModalSection
                        values={frValues}
                        onUpdate={(key, value) => onUpdate("fr", key, value)}
                        language="fr"
                    />
                    <SharingSection
                        values={frValues}
                        onUpdate={(key, value) => onUpdate("fr", key, value)}
                        language="fr"
                    />
                </BlockStack>
            </Card>

            {/* English */}
            <Card>
                <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                        English
                    </Text>
                    <ModalSection
                        values={enValues}
                        onUpdate={(key, value) => onUpdate("en", key, value)}
                        language="en"
                    />
                    <SharingSection
                        values={enValues}
                        onUpdate={(key, value) => onUpdate("en", key, value)}
                        language="en"
                    />
                </BlockStack>
            </Card>
        </BlockStack>
    );
}

// Logo Field Component
export function LogoField({
    logoUrl,
    onUpdate,
}: {
    logoUrl: string;
    onUpdate: (logoUrl: string) => void;
}) {
    const { t } = useTranslation();
    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                    {t("customizations.modal.logo.title")}
                </Text>
                <Text as="p" variant="bodyMd">
                    {t("customizations.modal.logo.description")}
                </Text>
                <TextField
                    label={t("customizations.fields.logoUrl.label")}
                    helpText={t("customizations.fields.logoUrl.description")}
                    placeholder={t("customizations.fields.logoUrl.placeholder")}
                    value={logoUrl || ""}
                    onChange={onUpdate}
                    multiline={true}
                    autoComplete="off"
                />
            </BlockStack>
        </Card>
    );
}
