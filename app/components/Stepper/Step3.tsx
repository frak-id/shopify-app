import type { OnboardingStepData } from "app/utils/onboarding";
import { useTranslation } from "react-i18next";
import { CreateShopifyWebhook } from "../Webhook";
import { CollapsibleStep } from "./CollapsibleStep";

export function Step3({
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    const { webhooks } = onboardingData;
    const { t } = useTranslation();
    const isWebhookExists = Boolean(webhooks?.length);

    return (
        <CollapsibleStep
            step={3}
            completed={isWebhookExists}
            title={t("stepper.step3.title")}
            description={t("stepper.step3.description")}
        >
            {!isWebhookExists && <CreateShopifyWebhook />}
        </CollapsibleStep>
    );
}
