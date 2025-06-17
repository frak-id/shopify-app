import { Text } from "@shopify/polaris";
import type { OnboardingStepData } from "app/utils/onboarding";
import { useTranslation } from "react-i18next";
import { StepItem } from ".";
import { Pixel } from "../Pixel";

export function Step2({
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    const { webPixel } = onboardingData;
    const { t } = useTranslation();

    // Check if the web pixel is connected
    const isPixelConnected = !!webPixel?.id;

    return (
        <StepItem checked={isPixelConnected}>
            <Text variant="bodyMd" as="p">
                {t("stepper2.step2.title")}
            </Text>
            {!isPixelConnected && <Pixel id={webPixel?.id} />}
        </StepItem>
    );
}
