import { useRouteLoaderData } from "@remix-run/react";
import { Button, Text } from "@shopify/polaris";
import type { loader as rootLoader } from "app/routes/app";
import type { OnboardingStepData } from "app/utils/onboarding";
import { useTranslation } from "react-i18next";
import { StepItem } from ".";

export function Step5({
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    const { theme, isThemeHasFrakActivated } = onboardingData;
    const { t } = useTranslation();
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const { id } = theme || {};
    const editorUrl = `https://${rootData?.shop?.myshopifyDomain}/admin/themes/current/editor`;
    const isFrakActivated = !!isThemeHasFrakActivated;

    return (
        <StepItem checked={isFrakActivated}>
            <Text variant="bodyMd" as="p">
                {t("stepper2.step5.title")}
            </Text>
            {!isFrakActivated && (
                <Button
                    variant="primary"
                    url={`${editorUrl}?context=apps&appEmbed=${id}/listener`}
                    target="_blank"
                >
                    {t("stepper2.step5.link")}
                </Button>
            )}
        </StepItem>
    );
}
