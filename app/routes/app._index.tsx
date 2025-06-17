import { Await, useNavigate, useRouteLoaderData } from "@remix-run/react";
import {
    Banner,
    BlockStack,
    Button,
    Card,
    Layout,
    Link,
    Page,
    Text,
} from "@shopify/polaris";
import type { loader as appLoader } from "app/routes/app";
import {
    type OnboardingStepData,
    getOnboardingStatusMessage,
    validateCompleteOnboarding,
} from "app/utils/onboarding";
import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const headers = () => {
    return {
        "Cache-Control":
            "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
        Vary: "Accept-Encoding",
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
    const rootData = useRouteLoaderData<typeof appLoader>("routes/app");
    const isThemeSupportedPromise = rootData?.isThemeSupportedPromise;
    const onboardingDataPromise = rootData?.onboardingDataPromise;
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
                    <Suspense>
                        <Await resolve={isThemeSupportedPromise}>
                            {(isThemeSupported) => {
                                return (
                                    <>
                                        {!isThemeSupported && (
                                            <ThemeNotSupported />
                                        )}
                                        {isThemeSupported && (
                                            <Await
                                                resolve={onboardingDataPromise}
                                            >
                                                {(resolved) =>
                                                    resolved && (
                                                        <ThemeSupported
                                                            onboardingData={
                                                                resolved
                                                            }
                                                        />
                                                    )
                                                }
                                            </Await>
                                        )}
                                    </>
                                );
                            }}
                        </Await>
                    </Suspense>
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
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    // Validate if onboarding is truly complete
    const validationResult = validateCompleteOnboarding(onboardingData);
    const statusMessage = getOnboardingStatusMessage(validationResult);
    const { t } = useTranslation();
    const [localOnBoarding, setLocalOnBoarding] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const frakOnboarding = window.localStorage.getItem("frak-onBoarding");
        setLocalOnBoarding(frakOnboarding === "done");

        // If localStorage says onboarding is done but server validation fails, redirect to onboarding
        if (frakOnboarding === "done" && !validationResult.isComplete) {
            // Clear the localStorage since it's not actually complete
            window.localStorage.removeItem("frak-onBoarding");
            setLocalOnBoarding(false);
            navigate("/app/onboarding");
        } else if (frakOnboarding !== "done") {
            navigate("/app/onboarding");
        }
    }, [navigate, validationResult.isComplete]);

    const isOnboardingComplete = localOnBoarding && validationResult.isComplete;

    return (
        <Layout.Section>
            <Card>
                <BlockStack gap="500">
                    {/* Show validation status banner if onboarding is marked complete locally but validation fails */}
                    {localOnBoarding && !validationResult.isComplete && (
                        <Banner tone="warning">
                            <Text as="p">{statusMessage.message}</Text>
                            <Text as="p" variant="bodySm">
                                Please complete the missing steps to activate
                                all features.
                            </Text>
                        </Banner>
                    )}

                    {isOnboardingComplete ? (
                        <BlockStack gap="300">
                            <Banner tone="success">
                                <Text as="p">{t("common.allSet")}</Text>
                                <Text as="p" variant="bodySm">
                                    {statusMessage.message}
                                </Text>
                            </Banner>
                        </BlockStack>
                    ) : (
                        <Link url="/app/onboarding">
                            {t("common.getStarted")}
                        </Link>
                    )}
                </BlockStack>
            </Card>
        </Layout.Section>
    );
}
