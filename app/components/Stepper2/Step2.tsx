import type { OnboardingStepData } from "app/utils/onboarding";
import { useTranslation } from "react-i18next";
import { Pixel } from "../Pixel";
import { CollapsibleStep } from "./CollapsibleStep";

export function Step2({
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    const { webPixel } = onboardingData;
    const { t } = useTranslation();
    const isPixelConnected = !!webPixel?.id;

    return (
        <CollapsibleStep
            step={2}
            completed={isPixelConnected}
            title={t("stepper2.step2.title")}
            description={t("stepper2.step2.description")}
        >
            {!isPixelConnected && <Pixel id={webPixel?.id} />}
        </CollapsibleStep>
    );
}
