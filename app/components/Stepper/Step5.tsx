import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { Badge, Box, Link, Text } from "@shopify/polaris";
import { CheckIcon, XSmallIcon } from "@shopify/polaris-icons";
import type { loader as rootLoader } from "app/routes/app";
import type { loader } from "app/routes/app.onboarding.$step";
import { useTranslation } from "react-i18next";
import screenShareButton from "../../assets/share-button.png";

export function Step5() {
    const data = useLoaderData<typeof loader>();
    const isThemeHasFrakButton = data?.isThemeHasFrakButton;
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
                {isThemeHasFrakButton ? (
                    <Step5Activated />
                ) : (
                    <Step5NotActivated />
                )}
            </Box>
        </Box>
    );
}

export function Step5Activated() {
    const { t } = useTranslation();

    return (
        <Text as="p" variant="bodyMd">
            <Badge tone="success" icon={CheckIcon}>
                {t("stepper.step5.activated")}
            </Badge>
        </Text>
    );
}

export function Step5NotActivated() {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const data = useLoaderData<typeof loader>();
    const firstProduct = data?.firstProduct;
    const editorUrl = `https://${rootData?.shop?.myshopifyDomain}/admin/themes/current/editor`;
    const { t } = useTranslation();

    return (
        <>
            <Text as="p" variant="bodyMd">
                <Badge tone="critical" icon={XSmallIcon}>
                    {t("stepper.step5.notActivated")}
                </Badge>
            </Text>
            <Box paddingBlockStart={"200"}>
                <Text as="p" variant="bodyMd">
                    {t("stepper.step5.todo")}
                </Text>
                <img src={screenShareButton} alt="" />
            </Box>
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
    );
}
