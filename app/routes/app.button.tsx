import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { BlockStack, Box, Card, Link, Page } from "@shopify/polaris";
import {
    Step5Activated,
    Step5NotActivated,
} from "app/components/Stepper/Step6";
import type { loader as rootLoader } from "app/routes/app";
import { firstProductPublished } from "app/services.server/shop";
import { doesThemeHasFrakButton } from "app/services.server/theme";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const isThemeHasFrakButton = await doesThemeHasFrakButton(context);
    const firstProduct = await firstProductPublished(context);
    return { isThemeHasFrakButton, firstProduct };
};

export default function buttonPage() {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const data = useLoaderData<typeof loader>();
    const isThemeHasFrakButton = data?.isThemeHasFrakButton;
    const firstProduct = data?.firstProduct;
    const editorUrl = `https://${rootData?.shop.myshopifyDomain}/admin/themes/current/editor`;
    const { t } = useTranslation();

    return (
        <Page title={t("button.title")}>
            <BlockStack gap="500">
                <Card>
                    <Box paddingBlockStart={"200"}>
                        {isThemeHasFrakButton && (
                            <>
                                <Step5Activated type="share" />
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
                        {!isThemeHasFrakButton && (
                            <Step5NotActivated
                                type="share"
                                defaultOpen={true}
                            />
                        )}
                    </Box>
                </Card>
            </BlockStack>
        </Page>
    );
}
