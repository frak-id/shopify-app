import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useRouteLoaderData } from "@remix-run/react";
import {
    BlockStack,
    Button,
    Card,
    Layout,
    Link,
    Page,
    Text,
    Banner,
} from "@shopify/polaris";
import type { loader as appLoader } from "app/routes/app";
import { authenticate } from "app/shopify.server";
import {
    fetchAllOnboardingData,
    validateCompleteOnboarding,
    getOnboardingStatusMessage,
    type OnboardingStepData,
} from "app/utils/onboarding";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Loader function that validates complete onboarding status
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    
    // Fetch all onboarding data to validate completion
    const onboardingData = await fetchAllOnboardingData(context);
    
    // Validate if onboarding is truly complete
    const validationResult = validateCompleteOnboarding(onboardingData);
    const statusMessage = getOnboardingStatusMessage(validationResult);
    
    return {
        onboardingValidation: validationResult,
        onboardingStatus: statusMessage,
        onboardingData,
    };
};

/**
 * todo: Index page of the Frak application on the shopify admin panel
 *  - Login with a Frak wallet if needed
 *  - Check if a product is present, otherwise, link to product page?
 *  - Quickly check product status? Active campaign etc? And redirect to business for more infos?
 *  - Setup pixel + webhook automatically?
 *
 *
 *  todo:
 *   - theme app extensions for the frak-setup js asset? https://shopify.dev/docs/apps/build/online-store/theme-app-extensions
 * @param request
 */
export default function Index() {
    const data = useLoaderData<typeof loader>();
    const rootData = useRouteLoaderData<typeof appLoader>("routes/app");
    const isThemeSupported = rootData?.isThemeSupported;
    const { t } = useTranslation();

    return (
        <Page
            title={t("common.title")}
            primaryAction={
                <Button
                    variant="primary"
                    url={process.env.BUSINESS_URL}
                    target="_blank"
                >
                    {t("common.goToDashboard")}
                </Button>
            }
        >
            <BlockStack gap="500">
                <Layout>
                    {!isThemeSupported && <ThemeNotSupported />}
                    {isThemeSupported && <ThemeSupported onboardingData={data} />}
                </Layout>
            </BlockStack>
        </Page>
    );
}

function ThemeNotSupported() {
    return (
        <Layout.Section>
            <Text as="p" variant="bodyMd">
                It looks like your theme does not fully support the
                functionality of this app.
            </Text>
            <Text as="p" variant="bodyMd">
                Try switching to a different theme or contacting your theme
                developer to request support.
            </Text>
        </Layout.Section>
    );
}

function ThemeSupported({ 
    onboardingData 
}: { 
    onboardingData: {
        onboardingValidation: { isComplete: boolean; failedSteps: number[]; completedSteps: number[]; };
        onboardingStatus: { status: "complete" | "incomplete"; message: string; failedSteps: number[]; };
        onboardingData: OnboardingStepData;
    } 
}) {
    const { t } = useTranslation();
    const [localOnBoarding, setLocalOnBoarding] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const frakOnboarding = window.localStorage.getItem("frak-onBoarding");
        setLocalOnBoarding(frakOnboarding === "done");

        // If localStorage says onboarding is done but server validation fails, redirect to onboarding
        if (frakOnboarding === "done" && !onboardingData.onboardingValidation.isComplete) {
            // Clear the localStorage since it's not actually complete
            window.localStorage.removeItem("frak-onBoarding");
            setLocalOnBoarding(false);
            navigate("/app/onboarding/step1");
        } else if (frakOnboarding !== "done") {
            navigate("/app/onboarding/step1");
        }
    }, [navigate, onboardingData.onboardingValidation.isComplete]);

    const isOnboardingComplete = localOnBoarding && onboardingData.onboardingValidation.isComplete;

    return (
        <Layout.Section>
            <Card>
                <BlockStack gap="500">
                    {/* Show validation status banner if onboarding is marked complete locally but validation fails */}
                    {localOnBoarding && !onboardingData.onboardingValidation.isComplete && (
                        <Banner tone="warning">
                            <Text as="p">{onboardingData.onboardingStatus.message}</Text>
                            <Text as="p" variant="bodySm">
                                Please complete the missing steps to activate all features.
                            </Text>
                        </Banner>
                    )}
                    
                    {isOnboardingComplete ? (
                        <BlockStack gap="300">
                            <Banner tone="success">
                                <Text as="p">{t("common.allSet")}</Text>
                                <Text as="p" variant="bodySm">
                                    {onboardingData.onboardingStatus.message}
                                </Text>
                            </Banner>
                        </BlockStack>
                    ) : (
                        <Link url="/app/onboarding/step1">
                            {t("common.getStarted")}
                        </Link>
                    )}
                </BlockStack>
            </Card>
        </Layout.Section>
    );
}
