import { Text } from "@shopify/polaris";
import type { OnboardingStepData } from "app/utils/onboarding";
import { useTranslation } from "react-i18next";
import { StepItem } from ".";
import { CreateShopifyWebhook } from "../Webhook";

export function Step3({
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    const { webhooks } = onboardingData;
    const { t } = useTranslation();
    const isWebhookExists = Boolean(webhooks?.length);

    return (
        <StepItem checked={isWebhookExists}>
            <Text variant="bodyMd" as="p">
                {t("stepper2.step3.title")}
            </Text>
            {!isWebhookExists && <CreateShopifyWebhook />}
        </StepItem>
    );
}
