import { useLoaderData } from "@remix-run/react";
import { Badge, Box, Text } from "@shopify/polaris";
import { CheckIcon, XSmallIcon } from "@shopify/polaris-icons";
import { Webhook } from "app/components/Webhook";
import type { loader } from "app/routes/app.onboarding.$step";
import { useTranslation } from "react-i18next";

export function Step3() {
    const data = useLoaderData<typeof loader>();
    const isWebhookExists = Boolean(data?.webhooks?.edges?.length);
    const { t } = useTranslation();

    return (
        <Box padding={"600"}>
            <Text as="h2" variant="headingXl">
                {t("stepper.step3.title")}
            </Text>
            <Box paddingBlockStart={"200"}>
                <Text as="p">{t("stepper.step3.description")}</Text>
            </Box>
            <Box paddingBlockStart={"200"}>
                {isWebhookExists && (
                    <Text as="p" variant="bodyMd">
                        <Badge tone="success" icon={CheckIcon}>
                            {t("stepper.step3.success")}
                        </Badge>
                    </Text>
                )}
                {!isWebhookExists && (
                    <>
                        <Text as="p" variant="bodyMd">
                            <Badge tone="critical" icon={XSmallIcon}>
                                {t("stepper.step3.notActivated")}
                            </Badge>
                        </Text>
                        <Box paddingBlockStart={"200"}>
                            <Webhook id={data?.webhooks?.edges[0]?.node?.id} />
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
