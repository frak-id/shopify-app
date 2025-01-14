import { useRouteLoaderData } from "@remix-run/react";
import { Badge, Box, Link, Text } from "@shopify/polaris";
import { CheckIcon, XSmallIcon } from "@shopify/polaris-icons";
import type { loader } from "app/routes/app";
import { useTranslation } from "react-i18next";

export function Step4() {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const isThemeHasFrakActivated = rootData?.isThemeHasFrakActivated;
    const { id } = rootData?.theme || {};
    const { t } = useTranslation();
    const editorUrl = `https://${rootData?.shop.myshopifyDomain}/admin/themes/current/editor`;

    return (
        <Box padding={"600"}>
            <Text as="h2" variant="headingXl">
                {t("stepper.step4.title")}
            </Text>
            <Box paddingBlockStart={"200"}>
                <Text as="p">{t("stepper.step4.description")}</Text>
            </Box>
            <Box paddingBlockStart={"200"}>
                {isThemeHasFrakActivated && (
                    <Text as="p" variant="bodyMd">
                        <Badge tone="success" icon={CheckIcon}>
                            {t("stepper.step4.activated")}
                        </Badge>
                    </Text>
                )}
                {!isThemeHasFrakActivated && (
                    <>
                        <Text as="p" variant="bodyMd">
                            <Badge tone="critical" icon={XSmallIcon}>
                                {t("stepper.step4.notActivated")}
                            </Badge>
                        </Text>
                        <Box paddingBlockStart={"200"}>
                            <Link
                                url={`${editorUrl}?context=apps&appEmbed=${id}/listener`}
                                target="_blank"
                            >
                                {t("stepper.step4.link")}
                            </Link>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
