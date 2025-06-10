import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Card, Page } from "@shopify/polaris";
import { Stepper } from "app/components/Stepper";
import { authenticate } from "app/shopify.server";
import { stepDataFetchers } from "app/utils/onboarding";
import { useTranslation } from "react-i18next";

/**
 * Extract the step number from the step string
 * @param step - The step string (step1, step2, etc.)
 */
function parseStepNumber(step?: string) {
    if (!step) return 1;
    return Number(step.replace(/\D/g, "")); // Extract only numbers
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const stepNumber = parseStepNumber(params.step);
    const stepHandler = stepDataFetchers[stepNumber as keyof typeof stepDataFetchers];
    const stepData = stepHandler ? await stepHandler(context) : {};

    return {
        step: stepNumber,
        ...stepData,
    };
};

export default function OnBoardingPage() {
    const { step } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <Page title={t("common.title")}>
            <BlockStack gap="500">
                <Card>
                    <Stepper step={step} />
                </Card>
            </BlockStack>
        </Page>
    );
}
