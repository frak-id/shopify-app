import { Await, useNavigate, useRouteLoaderData } from "@remix-run/react";
import {
    BlockStack,
    Box,
    Card,
    Icon,
    InlineStack,
    ProgressBar,
    Text,
} from "@shopify/polaris";
import { CheckIcon, DisabledIcon } from "@shopify/polaris-icons";
import { useVisibilityChange } from "app/hooks/useVisibilityChange";
import type { loader as appLoader } from "app/routes/app";
import {
    type OnboardingStepData,
    validateCompleteOnboarding,
} from "app/utils/onboarding";
import type { ReactNode } from "react";
import { Suspense, useCallback, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useRefreshData } from "../../hooks/useRefreshData";
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import { Step4 } from "./Step4";
import { Step5 } from "./Step5";
import { Step6 } from "./Step6";
import { UncheckedIcon } from "./UncheckedIcon";

const MAX_STEP = 6;

export function Stepper({
    redirectToApp,
}: {
    redirectToApp: boolean;
}) {
    const refresh = useRefreshData();
    const { t } = useTranslation();
    const rootData = useRouteLoaderData<typeof appLoader>("routes/app");
    const onboardingDataPromise = rootData?.onboardingDataPromise;

    useVisibilityChange(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    return (
        <Card>
            <Box paddingBlockEnd="400">
                <Text variant="headingSm" as="h2">
                    {t("stepper.title")}
                </Text>
            </Box>

            <BlockStack gap="600">
                <Suspense>
                    <Await resolve={onboardingDataPromise}>
                        {(onboardingData) => {
                            if (!onboardingData) return null;
                            return (
                                <>
                                    <StepsIntroduction
                                        onboardingData={onboardingData}
                                        redirectToApp={redirectToApp}
                                    />
                                    <Steps onboardingData={onboardingData} />
                                </>
                            );
                        }}
                    </Await>
                </Suspense>
                <StepsFooter />
            </BlockStack>
        </Card>
    );
}

function StepsIntroduction({
    onboardingData,
    redirectToApp,
}: {
    onboardingData: OnboardingStepData;
    redirectToApp: boolean;
}) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { completedSteps } = validateCompleteOnboarding(onboardingData);
    const completedStep = completedSteps.length;
    const progress = (completedStep / MAX_STEP) * 100;

    useEffect(() => {
        if (progress === 100 && redirectToApp) {
            // Small delay to ensure the progress bar is updated
            setTimeout(() => {
                navigate("/app");
            }, 1000);
        }
    }, [progress, navigate, redirectToApp]);

    return (
        <BlockStack gap="200">
            <Text variant="bodyMd" as="p" fontWeight="bold">
                {t("stepper.description")}
            </Text>

            <InlineStack gap={"200"} wrap={false} blockAlign="center">
                <span style={{ whiteSpace: "nowrap" }}>
                    <Text variant="bodySm" tone="subdued" as="p">
                        {t("stepper.completedStep", {
                            completedStep,
                            totalSteps: MAX_STEP,
                        })}
                    </Text>
                </span>
                <div style={{ maxWidth: "275px", width: "100%" }}>
                    <ProgressBar progress={progress} size="small" />
                </div>
            </InlineStack>
        </BlockStack>
    );
}

function Steps({ onboardingData }: { onboardingData: OnboardingStepData }) {
    return (
        <Box paddingInlineStart="400">
            <BlockStack gap="600">
                <Step1 onboardingData={onboardingData} />
                <Step2 onboardingData={onboardingData} />
                <Step3 onboardingData={onboardingData} />
                <Step4 onboardingData={onboardingData} />
                <Step5 onboardingData={onboardingData} />
                <Step6 onboardingData={onboardingData} />
            </BlockStack>
        </Box>
    );
}

type StepItemProps = {
    checked: boolean;
    stepNumber: number;
    children: ReactNode;
    currentStep: number;
};

export function StepItem({
    checked,
    stepNumber,
    children,
    currentStep,
}: StepItemProps) {
    return (
        <InlineStack gap="200" blockAlign="center" wrap={false}>
            <Box>
                {checked ? (
                    <Icon source={CheckIcon} tone="base" />
                ) : (
                    <>
                        {currentStep === stepNumber ? (
                            <Icon source={UncheckedIcon} tone="base" />
                        ) : (
                            <Icon source={DisabledIcon} tone="subdued" />
                        )}
                    </>
                )}
            </Box>
            <InlineStack gap="100" blockAlign="center" wrap={false}>
                <Box>
                    <Text variant="bodyMd" tone="subdued" as="p">
                        {stepNumber}.
                    </Text>
                </Box>
                {children}
            </InlineStack>
        </InlineStack>
    );
}

function StepsFooter() {
    return (
        <Box>
            <Text variant="bodySm" tone="subdued" as="p">
                <Trans
                    i18nKey="stepper.footer"
                    components={{
                        a: (
                            <a
                                href="mailto:hello@frak-labs.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="hello@frak-labs.com"
                            >
                                hello@frak-labs.com
                            </a>
                        ),
                    }}
                />
            </Text>
        </Box>
    );
}
