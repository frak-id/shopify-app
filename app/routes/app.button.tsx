import { useRouteLoaderData } from "@remix-run/react";
import { BlockStack, Box, Card, Link, Page } from "@shopify/polaris";
import {
    Step5Activated,
    Step5NotActivated,
} from "app/components/Stepper/Step5";
import type { loader } from "app/routes/app";
import { useTranslation } from "react-i18next";

export default function buttonPage() {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const isThemeHasFrakButton = rootData?.isThemeHasFrakButton;
    const firstProduct = rootData?.firstProduct;
    const editorUrl = `https://${rootData?.shop.myshopifyDomain}/admin/themes/current/editor`;
    const { t } = useTranslation();
    return (
        <Page title={t("button.title")}>
            <BlockStack gap="500">
                <Card>
                    <Box paddingBlockStart={"200"}>
                        {isThemeHasFrakButton && (
                            <>
                                <Step5Activated />
                                <Box paddingBlockStart={"200"}>
                                    {firstProduct ? (
                                        <Link
                                            url={`${editorUrl}?previewPath=/products/${firstProduct.handle}`}
                                            target="_blank"
                                        >
                                            {t("button.link")}
                                        </Link>
                                    ) : (
                                        <>{t("stepper.step5.noProduct")}</>
                                    )}
                                </Box>
                            </>
                        )}
                        {!isThemeHasFrakButton && <Step5NotActivated />}
                    </Box>
                </Card>
            </BlockStack>
        </Page>
    );
}
