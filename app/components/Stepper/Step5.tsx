import { useRouteLoaderData } from "@remix-run/react";
import { Badge, Box, Link, Text } from "@shopify/polaris";
import { CheckIcon, XSmallIcon } from "@shopify/polaris-icons";
import type { loader } from "app/routes/app";
import { useTranslation } from "react-i18next";

export function Step5() {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const isThemeHasFrakButton = rootData?.isThemeHasFrakButton;
    const firstProduct = rootData?.firstProduct;
    const editorUrl = `https://${rootData?.shop.myshopifyDomain}/admin/themes/current/editor`;
    const { t } = useTranslation();

    return (
        <Box padding={"600"}>
            <Text as="h2" variant="headingXl">
                {t("stepper.step5.title")}
            </Text>
            <Box paddingBlockStart={"200"}>
                <Text as="p">{t("stepper.step5.description")}</Text>
            </Box>
            <Box paddingBlockStart={"200"}>
                {isThemeHasFrakButton && (
                    <Text as="p" variant="bodyMd">
                        <Badge tone="success" icon={CheckIcon}>
                            {t("stepper.step5.activated")}
                        </Badge>
                    </Text>
                )}
                {!isThemeHasFrakButton && (
                    <>
                        <Text as="p" variant="bodyMd">
                            <Badge tone="critical" icon={XSmallIcon}>
                                {t("stepper.step5.notActivated")}
                            </Badge>
                        </Text>
                        <Box paddingBlockStart={"200"}>
                            <Text as="p" variant="bodyMd">
                                {firstProduct ? (
                                    <Link
                                        url={`${editorUrl}?previewPath=/products/${firstProduct.handle}`}
                                        target="_blank"
                                    >
                                        {t("stepper.step5.link")}
                                    </Link>
                                ) : (
                                    <>{t("stepper.step5.noProduct")}</>
                                )}
                            </Text>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
