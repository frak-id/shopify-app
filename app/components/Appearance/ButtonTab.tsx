import { useRouteLoaderData } from "@remix-run/react";
import { Box, Card, Link } from "@shopify/polaris";
import {
    Step5Activated,
    Step5NotActivated,
} from "app/components/Stepper/Step6";
import type { loader as rootLoader } from "app/routes/app";
import { useTranslation } from "react-i18next";

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
                    <Step5NotActivated type="share" defaultOpen={true} />
                )}
            </Box>
        </Card>
    );
}
