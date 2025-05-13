import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { BlockStack, Box, Card, Link, Page } from "@shopify/polaris";
import {
    Step5Activated,
    WalletNotActivated,
} from "app/components/Stepper/Step6";
import type { loader as rootLoader } from "app/routes/app";
import { doesThemeHasFrakWalletButton } from "app/services.server/theme";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const themeWalletButton = await doesThemeHasFrakWalletButton(context);
    return { themeWalletButton };
};

export default function WalletButtonPage() {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const data = useLoaderData<typeof loader>();
    const themeWalletButton = data?.themeWalletButton;
    const editorUrl = `https://${rootData?.shop.myshopifyDomain}/admin/themes/current/editor`;
    const { t } = useTranslation();

    return (
        <Page title={t("walletButton.title")}>
            <BlockStack>
                <Card>
                    <Box>
                        {themeWalletButton && (
                            <>
                                <Step5Activated type="wallet" />
                                <Box paddingBlockStart={"200"}>
                                    <Link
                                        url={`${editorUrl}?context=apps&appEmbed=${themeWalletButton}%2Fwallet_button`}
                                        target="_blank"
                                    >
                                        {t("walletButton.link")}
                                    </Link>
                                </Box>
                            </>
                        )}
                        {!themeWalletButton && (
                            <WalletNotActivated
                                defaultOpen={true}
                                editorUrl={editorUrl}
                            />
                        )}
                    </Box>
                </Card>
            </BlockStack>
        </Page>
    );
}
