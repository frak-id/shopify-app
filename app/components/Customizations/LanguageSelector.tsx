import { BlockStack, Card, ChoiceList, Text } from "@shopify/polaris";

type LanguageMode = "single" | "multi";

// Language Mode Selector Component
export function LanguageModeSelector({
    mode,
    onModeChange,
}: {
    mode: LanguageMode;
    onModeChange: (mode: LanguageMode) => void;
}) {
    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                    Language Configuration
                </Text>
                <ChoiceList
                    title="Choose your language setup"
                    choices={[
                        {
                            label: "Single Language",
                            value: "single",
                            helpText:
                                "Use the same text for all users regardless of their location",
                        },
                        {
                            label: "Multiple Languages",
                            value: "multi",
                            helpText:
                                "Provide different text for French and English. Users will see text based on their browser language or location",
                        },
                    ]}
                    selected={[mode]}
                    onChange={(value) => onModeChange(value[0] as LanguageMode)}
                />
            </BlockStack>
        </Card>
    );
}
