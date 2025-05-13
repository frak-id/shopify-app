import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { BlockStack, Box, Card, Link, Page } from "@shopify/polaris";
import {
    Step4Activated,
    Step4NotActivated,
} from "app/components/Stepper/Step5";
import type { loader as rootLoader } from "app/routes/app";
import {
    doesThemeHasFrakActivated,
    getMainThemeId,
} from "app/services.server/theme";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const isThemeHasFrakActivated = await doesThemeHasFrakActivated(context);
    const theme = await getMainThemeId(context.admin.graphql);
    return { isThemeHasFrakActivated, theme };
};

export default function ThemePage() {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const data = useLoaderData<typeof loader>();
    const isThemeHasFrakActivated = data?.isThemeHasFrakActivated;
    const { id } = data?.theme || {};
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
