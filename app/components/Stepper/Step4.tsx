import { useRouteLoaderData } from "@remix-run/react";
import { Badge, Box, Link, Text } from "@shopify/polaris";
import { CheckIcon, XSmallIcon } from "@shopify/polaris-icons";
import type { loader } from "app/routes/app";
import { useTranslation } from "react-i18next";
import screenFrakListener from "../../assets/frak-listener.png";

export function Step4() {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const isThemeHasFrakActivated = rootData?.isThemeHasFrakActivated;
    const { t } = useTranslation();

    return (
        <Box padding={"600"}>
            <Text as="h2" variant="headingXl">
                {t("stepper.step4.title")}
            </Text>
            <Box paddingBlockStart={"200"}>
                <Text as="p">{t("stepper.step4.description")}</Text>
            </Box>
            <Box paddingBlockStart={"200"}>
                {isThemeHasFrakActivated ? (
                    <Step4Activated />
                ) : (
                    <Step4NotActivated />
                )}
            </Box>
        </Box>
    );
}

export function Step4Activated() {
    const { t } = useTranslation();

    return (
        <Text as="p" variant="bodyMd">
            <Badge tone="success" icon={CheckIcon}>
                {t("stepper.step4.activated")}
            </Badge>
        </Text>
    );
}

export function Step4NotActivated() {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const { id } = rootData?.theme || {};
    const { t } = useTranslation();
    const editorUrl = `https://${rootData?.shop.myshopifyDomain}/admin/themes/current/editor`;

    return (
        <>
            <Text as="p" variant="bodyMd">
                <Badge tone="critical" icon={XSmallIcon}>
                    {t("stepper.step4.notActivated")}
                </Badge>
            </Text>
            <Box paddingBlockStart={"200"}>
                <Text as="p" variant="bodyMd">
                    {t("stepper.step4.todo")}
                </Text>
                <img src={screenFrakListener} alt="" />
            </Box>
            <Box paddingBlockStart={"200"}>
                <Link
                    url={`${editorUrl}?context=apps&appEmbed=${id}/listener`}
                    target="_blank"
                >
                    {t("stepper.step4.link")}
                </Link>
            </Box>
        </>
    );
}
