import type { OnboardingStepData } from "app/utils/onboarding";
import { useTranslation } from "react-i18next";
import { FrakWebhook } from "../Webhook";
import { CollapsibleStep } from "./CollapsibleStep";

export function Step4({
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    const { frakWebhook, productId } = onboardingData;
    const { t } = useTranslation();
    const isFrakWebhookExists = frakWebhook?.setup;

    return (
        <CollapsibleStep
            step={4}
            completed={!!isFrakWebhookExists}
            title={t("stepper.step4.title")}
            description={t("stepper.step4.description")}
        >
            {!isFrakWebhookExists && productId && (
                <FrakWebhook setup={false} productId={productId} />
            )}
        </CollapsibleStep>
    );
}
