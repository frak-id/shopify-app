import { useLoaderData, useNavigate, useRevalidator } from "@remix-run/react";
import { Button, InlineStack, ProgressBar, Text } from "@shopify/polaris";
import { Step1 } from "app/components/Stepper/Step1";
import { Step2 } from "app/components/Stepper/Step2";
import { Step3 } from "app/components/Stepper/Step3";
import { Step4 } from "app/components/Stepper/Step4";
import { Step5 } from "app/components/Stepper/Step5";
import { Step6 } from "app/components/Stepper/Step6";
import { Step7 } from "app/components/Stepper/Step7";
import { useVisibilityChange } from "app/hooks/useVisibilityChange";
import type { loader } from "app/routes/app.onboarding.$step";
import { validateStep } from "app/utils/onboarding";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRefreshData } from "../../hooks/useRefreshData";

const MAX_STEP = 7;

export function Stepper({ step }: { step: number }) {
    const data = useLoaderData<typeof loader>();
    const { state } = useRevalidator();
    const refresh = useRefreshData();
    const { t } = useTranslation();
    const navigate = useNavigate();

    useVisibilityChange(
        useCallback(() => {
            refresh();
        }, [refresh])
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
            {step === 7 && <Step7 />}

            <div style={{ display: "flex" }}>
                {step > 1 && (
                    <Button
                        onClick={() =>
                            navigate(`/app/onboarding/step${step - 1}`)
                        }
                    >
                        {t("stepper.back")}
                    </Button>
                )}
                <div style={{ marginLeft: "auto" }}>
                    {step < MAX_STEP && (
                        <Button
                            variant="primary"
                            onClick={() =>
                                navigate(`/app/onboarding/step${step + 1}`)
                            }
                            loading={state === "loading"}
                            disabled={validateStep(step, data)}
                        >
                            {t("stepper.next")}
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}


