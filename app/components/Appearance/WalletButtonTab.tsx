import { Box, Card, Link } from "@shopify/polaris";
import type { loader as rootLoader } from "app/routes/app";
import { useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router";
import screenWalletButton from "../../assets/wallet-button.png";
import { Activated } from "../Activated";
import { Instructions } from "../Instructions";

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
                        <Activated
                            text={t("appearance.walletButton.activated")}
                        />
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
                {!themeWalletButton && <WalletButtonNotActivated />}
            </Box>
        </Card>
    );
}

function WalletButtonNotActivated() {
    const { t } = useTranslation();
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const editorUrl = `https://${rootData?.shop?.myshopifyDomain}/admin/themes/current/editor`;

    return (
        <Instructions
            badgeText={t("appearance.walletButton.notActivated")}
            todoText={t("appearance.walletButton.todo")}
            image={screenWalletButton}
        >
            <Link url={`${editorUrl}?context=apps`} target="_blank">
                {t("appearance.walletButton.link")}
            </Link>
        </Instructions>
    );
}
