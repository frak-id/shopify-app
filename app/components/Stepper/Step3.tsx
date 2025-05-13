import { useLoaderData } from "@remix-run/react";
import { Badge, Box, Text } from "@shopify/polaris";
import { CheckIcon, XSmallIcon } from "@shopify/polaris-icons";
import { Pixel } from "app/components/Pixel";
import type { loader } from "app/routes/app.onboarding.$step";
import { useTranslation } from "react-i18next";

export function Step3() {
    const data = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <Box padding={"600"}>
            <Text as="h2" variant="headingXl">
                {t("stepper.step2.title")}
            </Text>
            <Box paddingBlockStart={"200"}>
                <Text as="p">{t("stepper.step2.description")}</Text>
            </Box>
            <Box paddingBlockStart={"200"}>
                {data?.webPixel?.id && (
                    <Text as="p" variant="bodyMd">
                        <Badge tone="success" icon={CheckIcon}>
                            {t("stepper.step2.success")}
                        </Badge>
                    </Text>
                )}
                {!data?.webPixel?.id && (
                    <>
                        <Text as="p" variant="bodyMd">
                            <Badge tone="critical" icon={XSmallIcon}>
                                {t("stepper.step2.notActivated")}
                            </Badge>
                        </Text>
                        <Box paddingBlockStart={"200"}>
                            <Pixel id={data?.webPixel?.id} />
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
