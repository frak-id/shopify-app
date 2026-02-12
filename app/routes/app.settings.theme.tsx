import { BlockStack, Box, Card, Link } from "@shopify/polaris";
import screenFrakListener from "app/assets/frak-listener.png";
import { Activated } from "app/components/Activated";
import { Instructions } from "app/components/Instructions";
import { useRefreshData } from "app/hooks/useRefreshData";
import { useVisibilityChange } from "app/hooks/useVisibilityChange";
import type { loader as rootLoader } from "app/routes/app";
import {
    doesThemeHasFrakActivated,
    getMainThemeId,
} from "app/services.server/theme";
import { authenticate } from "app/shopify.server";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRouteLoaderData } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const isThemeHasFrakActivated = await doesThemeHasFrakActivated(context);
    const theme = await getMainThemeId(context);
    return { isThemeHasFrakActivated, theme };
};

export default function SettingsThemePage() {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const data = useLoaderData<typeof loader>();
    const isThemeHasFrakActivated = data?.isThemeHasFrakActivated;
    const { id } = data?.theme || {};
    const { t } = useTranslation();
    const editorUrl = `https://${rootData?.shop.myshopifyDomain}/admin/themes/current/editor`;
    const refresh = useRefreshData();

    useVisibilityChange(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    return (
        <BlockStack gap="500">
            <Card>
                <Box paddingBlockStart={"200"}>
                    {isThemeHasFrakActivated && (
                        <>
                            <Activated text={t("theme.connected")} />
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
                    {!isThemeHasFrakActivated && <ThemeNotActivated />}
                </Box>
            </Card>
        </BlockStack>
    );
}

function ThemeNotActivated() {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const { t } = useTranslation();
    const editorUrl = `https://${rootData?.shop?.myshopifyDomain}/admin/themes/current/editor`;

    return (
        <Instructions
            badgeText={t("theme.notConnected")}
            todoText={t("theme.todo")}
            image={screenFrakListener}
        >
            <Link url={`${editorUrl}?context=apps`} target="_blank">
                {t("theme.link")}
            </Link>
        </Instructions>
    );
}
