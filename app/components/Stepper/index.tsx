import { useRevalidator, useRouteLoaderData } from "@remix-run/react";
import { Button, InlineStack, ProgressBar, Text } from "@shopify/polaris";
import { Step1 } from "app/components/Stepper/Step1";
import { Step2 } from "app/components/Stepper/Step2";
import { Step3 } from "app/components/Stepper/Step3";
import { Step4 } from "app/components/Stepper/Step4";
import { Step5 } from "app/components/Stepper/Step5";
import { Step6 } from "app/components/Stepper/Step6";
import { useVisibilityChange } from "app/hooks/useVisibilityChange";
import type { loader } from "app/routes/app";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

const MAX_STEP = 6;

export function Stepper() {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const { revalidate, state } = useRevalidator();
    const { t } = useTranslation();
    const [step, setStep] = useState(1);

    useVisibilityChange(
        useCallback(() => {
            revalidate();
        }, [revalidate])
    );

    return (
        <>
            <InlineStack
                gap={"200"}
                wrap={false}
                align="center"
                blockAlign="center"
            >
                <Text as="p" variant="bodyMd">
                    <span style={{ whiteSpace: "nowrap" }}>
                        {t("stepper.step")} {step}/{MAX_STEP}
                    </span>
                </Text>
                <ProgressBar progress={(step / MAX_STEP) * 100} size="small" />
            </InlineStack>

            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
            {step === 5 && <Step5 />}
            {step === 6 && <Step6 />}

            <div style={{ display: "flex" }}>
                {step > 1 && (
                    <Button onClick={() => setStep((prev) => prev - 1)}>
                        {t("stepper.back")}
                    </Button>
                )}
                <div style={{ marginLeft: "auto" }}>
                    {step < MAX_STEP && (
                        <Button
                            variant="primary"
                            onClick={() => setStep((prev) => prev + 1)}
                            loading={state === "loading"}
                            disabled={validateSteps(step, rootData)}
                        >
                            {t("stepper.next")}
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}

type RouteLoaderData = ReturnType<typeof useRouteLoaderData<typeof loader>>;
type StepValidation = {
    [key: number]: (data: RouteLoaderData) => boolean;
};

/**
 * Validation functions for each step
 */
const stepValidations: StepValidation = {
    1: () => true,
    2: (data) => Boolean(data?.webPixel?.id),
    3: (data) => Boolean(data?.webhooks?.edges?.length),
    4: (data) => Boolean(data?.isThemeHasFrakActivated),
    5: (data) => Boolean(data?.isThemeHasFrakButton),
};

/**
 * Validates if a specific step is completed based on the provided data
 * @param step - The step number to validate
 * @param data - The route loader data
 * @returns boolean indicating if the step is valid
 */
function validateSteps(step: number, data: RouteLoaderData): boolean {
    const validator = stepValidations[step];
    return validator ? !validator(data) : false;
}
