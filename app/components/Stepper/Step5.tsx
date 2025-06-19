import { useRouteLoaderData } from "@remix-run/react";
import { Button, Text } from "@shopify/polaris";
import type { loader as rootLoader } from "app/routes/app";
import type { OnboardingStepData } from "app/utils/onboarding";
import { Trans, useTranslation } from "react-i18next";
import screenFrakListener from "../../assets/frak-listener.png";
import { CollapsibleStep } from "./CollapsibleStep";

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
        <CollapsibleStep
            step={5}
            completed={isFrakActivated}
            title={t("stepper.step5.title")}
        >
            <Text as="p" variant="bodyMd">
                <Trans i18nKey="stepper.step5.description" />
            </Text>
            <img src={screenFrakListener} alt="" />
            <Button
                variant="primary"
                url={`${editorUrl}?context=apps&appEmbed=${id}/listener`}
                target="_blank"
            >
                {t("stepper.step5.link")}
            </Button>
        </CollapsibleStep>
    );
}
