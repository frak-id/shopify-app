import { useRouteLoaderData } from "@remix-run/react";
import { Box, Card, Link } from "@shopify/polaris";
import {
    Step5Activated,
    WalletNotActivated,
} from "app/components/Stepper/Step6";
import type { loader as rootLoader } from "app/routes/app";
import { useTranslation } from "react-i18next";

interface WalletButtonTabProps {
    themeWalletButton?: string | null;
}

export function WalletButtonTab({ themeWalletButton }: WalletButtonTabProps) {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const editorUrl = `https://${rootData?.shop.myshopifyDomain}/admin/themes/current/editor`;
    const { t } = useTranslation();

    return (
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
                                {t("appearance.walletButton.link")}
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
    );
}
