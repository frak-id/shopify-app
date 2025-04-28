import { Box, Button, Text } from "@shopify/polaris";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function Step7() {
    const { t } = useTranslation();

    useEffect(() => {
        window.localStorage.setItem("frak-onBoarding", "done");
    }, []);

    return (
        <Box padding={"600"}>
            <Text as="h2" variant="headingXl">
                {t("stepper.step6.title")}
            </Text>
            <Box paddingBlockStart={"200"}>
                <Text as="p">{t("stepper.step6.description")}</Text>
                <Box paddingBlockStart={"200"}>
                    <Button
                        variant="primary"
                        url={process.env.BUSINESS_URL}
                        target="_blank"
                    >
                        {t("common.goToDashboard")}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
