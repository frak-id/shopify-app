import { Box, Card, Link } from "@shopify/polaris";
import type { loader as rootLoader } from "app/routes/app";
import type { loader } from "app/routes/app.appearance";
import { useTranslation } from "react-i18next";
import { useLoaderData, useRouteLoaderData } from "react-router";
import screenShareButton from "../../assets/share-button.png";
import { Activated } from "../Activated";
import { Instructions } from "../Instructions";

interface ButtonTabProps {
    isThemeHasFrakButton: boolean;
    firstProduct?: {
        handle: string;
    } | null;
}

export function ButtonTab({
    isThemeHasFrakButton,
    firstProduct,
}: ButtonTabProps) {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const editorUrl = `https://${rootData?.shop.myshopifyDomain}/admin/themes/current/editor`;
    const { t } = useTranslation();

    return (
        <Card>
            <Box>
                {isThemeHasFrakButton && (
                    <>
                        <Activated
                            text={t("appearance.shareButton.activated")}
                        />
                        <Box paddingBlockStart={"200"}>
                            {firstProduct ? (
                                <Link
                                    url={`${editorUrl}?previewPath=/products/${firstProduct.handle}`}
                                    target="_blank"
                                >
                                    {t("appearance.shareButton.link")}
                                </Link>
                            ) : (
                                t("appearance.shareButton.noProduct")
                            )}
                        </Box>
                    </>
                )}
                {!isThemeHasFrakButton && <ButtonNotActivated />}
            </Box>
        </Card>
    );
}

function ButtonNotActivated() {
    const { t } = useTranslation();
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const data = useLoaderData<typeof loader>();
    const firstProduct = data?.firstProduct;
    const editorUrl = `https://${rootData?.shop?.myshopifyDomain}/admin/themes/current/editor`;

    return (
        <Instructions
            badgeText={t("appearance.shareButton.notActivated")}
            todoText={t("appearance.shareButton.todo")}
            image={screenShareButton}
        >
            {firstProduct ? (
                <Link
                    url={`${editorUrl}?previewPath=/products/${firstProduct.handle}`}
                    target="_blank"
                >
                    {t("appearance.shareButton.link")}
                </Link>
            ) : (
                t("appearance.shareButton.noProduct")
            )}
        </Instructions>
    );
}
