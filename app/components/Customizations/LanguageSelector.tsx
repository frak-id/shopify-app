import { BlockStack, Card, ChoiceList, Text } from "@shopify/polaris";
import { useTranslation } from "react-i18next";

type LanguageMode = "single" | "multi";

interface LanguageModeSelectorProps {
    mode: LanguageMode;
    onModeChange: (mode: LanguageMode) => void;
}

export function LanguageModeSelector({
    mode,
    onModeChange,
}: LanguageModeSelectorProps) {
    const { t } = useTranslation();

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                    {t("customizations.languageMode.title")}
                </Text>
                <ChoiceList
                    title={t("customizations.languageMode.choiceTitle")}
                    choices={[
                        {
                            label: t(
                                "customizations.languageMode.single.label"
                            ),
                            value: "single",
                            helpText: t(
                                "customizations.languageMode.single.helpText"
                            ),
                        },
                        {
                            label: t("customizations.languageMode.multi.label"),
                            value: "multi",
                            helpText: t(
                                "customizations.languageMode.multi.helpText"
                            ),
                        },
                    ]}
                    selected={[mode]}
                    onChange={(value) => onModeChange(value[0] as LanguageMode)}
                />
            </BlockStack>
        </Card>
    );
}
