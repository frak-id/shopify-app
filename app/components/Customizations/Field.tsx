import { BlockStack, Card, Text } from "@shopify/polaris";
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
    // Use 'en' as the default language for single mode
    const currentValues = customizations.en || {};

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
    return (
        <BlockStack gap="500">
            {/* French */}
            <Card>
                <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                        French (Français)
                    </Text>
                    <ModalSection
                        values={customizations.fr || {}}
                        onUpdate={(key, value) => onUpdate("fr", key, value)}
                        language="fr"
                    />
                    <SharingSection
                        values={customizations.fr || {}}
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
                        values={customizations.en || {}}
                        onUpdate={(key, value) => onUpdate("en", key, value)}
                        language="en"
                    />
                    <SharingSection
                        values={customizations.en || {}}
                        onUpdate={(key, value) => onUpdate("en", key, value)}
                        language="en"
                    />
                </BlockStack>
            </Card>
        </BlockStack>
    );
}
