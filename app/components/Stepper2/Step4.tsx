import { Text } from "@shopify/polaris";
import type { OnboardingStepData } from "app/utils/onboarding";
import { useTranslation } from "react-i18next";
import { StepItem } from ".";
import { FrakWebhook } from "../Webhook";

export function Step4({
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    const { frakWebhook, productId } = onboardingData;
    const { t } = useTranslation();
    const isFrakWebhookExists = frakWebhook?.setup;

    return (
        <StepItem checked={!!isFrakWebhookExists}>
            <Text variant="bodyMd" as="p">
                {t("stepper2.step4.title")}
            </Text>
            {!isFrakWebhookExists && productId && (
                <FrakWebhook setup={false} productId={productId} />
            )}
        </StepItem>
    );
}
