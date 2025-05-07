import { useRevalidator } from "@remix-run/react";
import { BlockStack, Box, Button, Card, Text } from "@shopify/polaris";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

type SetupInstructionsProps = {
    link: string;
};

export function SetupInstructions({ link }: SetupInstructionsProps) {
    const { t } = useTranslation();
    const { revalidate } = useRevalidator();

    const openModal = useCallback(() => {
        const openedWindow = window.open(
            link,
            "frak-business",
            "menubar=no,status=no,scrollbars=no,fullscreen=no,width=500, height=800"
        );

        if (openedWindow) {
            openedWindow.focus();

            // Check every 500ms if the window is closed
            // If it is, revalidate the page
            const timer = setInterval(() => {
                if (openedWindow.closed) {
                    clearInterval(timer);
                    setTimeout(() => revalidate(), 1000);
                }
            }, 500);
        }
    }, [link, revalidate]);

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                    {t("status.setupInstructions.title")}
                </Text>

                <BlockStack gap="200">
                    <Text as="p">
                        {t("status.setupInstructions.description")}
                    </Text>
                </BlockStack>

                <Box>
                    <Button onClick={openModal} variant="primary">
                        {t("status.modal.button")}
                    </Button>
                </Box>
            </BlockStack>
        </Card>
    );
}
