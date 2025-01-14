import { Box, Text } from "@shopify/polaris";
import { useTranslation } from "react-i18next";

export function Step1() {
    const { t } = useTranslation();

    return (
        <Box padding={"600"}>
            <Text as="h2" variant="headingXl">
                {t("stepper.step1.title")}
            </Text>
            <Box paddingBlockStart={"200"}>
                <Text as="p">{t("stepper.step1.description")}</Text>
            </Box>
        </Box>
    );
}
