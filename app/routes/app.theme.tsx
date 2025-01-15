import { useRouteLoaderData } from "@remix-run/react";
import { BlockStack, Box, Card, Link, Page } from "@shopify/polaris";
import {
    Step4Activated,
    Step4NotActivated,
} from "app/components/Stepper/Step4";
import type { loader } from "app/routes/app";
import { useTranslation } from "react-i18next";

export default function ThemePage() {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const isThemeHasFrakActivated = rootData?.isThemeHasFrakActivated;
    const { id } = rootData?.theme || {};
    const { t } = useTranslation();
    const editorUrl = `https://${rootData?.shop.myshopifyDomain}/admin/themes/current/editor`;

    return (
        <Page title={t("theme.title")}>
            <BlockStack gap="500">
                <Card>
                    <Box paddingBlockStart={"200"}>
                        {isThemeHasFrakActivated && (
                            <>
                                <Step4Activated />
                                <Box paddingBlockStart={"200"}>
                                    <Link
                                        url={`${editorUrl}?context=apps&appEmbed=${id}/listener`}
                                        target="_blank"
                                    >
                                        {t("theme.link")}
                                    </Link>
                                </Box>
                            </>
                        )}
                        {!isThemeHasFrakActivated && <Step4NotActivated />}
                    </Box>
                </Card>
            </BlockStack>
        </Page>
    );
}
