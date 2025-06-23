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
import { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CampaignStatus } from "../components/Campaign";
import { BankingStatus } from "../components/Funding/Bank";

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
    onboardingData.shopInfo;
    // Validate if onboarding is truly complete
    const validationResult = validateCompleteOnboarding(onboardingData);
    const statusMessage = getOnboardingStatusMessage(validationResult);
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to onboarding if onboarding is not complete
        if (!validationResult.isComplete) {
            navigate("/app/onboarding");
        }
    }, [navigate, validationResult.isComplete]);

    return (
        <Layout.Section>
            <BlockStack gap="500">
                {/* Show validation status banner if onboarding is marked complete locally but validation fails */}
                {!validationResult.isComplete && (
                    <Card>
                        <Banner tone="warning">
                            <Text as="p">{statusMessage}</Text>
                            <Text as="p" variant="bodySm">
                                Please complete the missing steps to activate
                                all features.
                            </Text>
                            <Link url="/app/onboarding">
                                {t("common.getStarted")}
                            </Link>
                        </Banner>
                    </Card>
                )}
                <OnBoardingComplete onboardingData={onboardingData} />
            </BlockStack>
        </Layout.Section>
    );
}

function OnBoardingComplete({
    onboardingData,
}: { onboardingData: OnboardingStepData }) {
    if (!onboardingData.shopInfo) {
        return null;
    }

    return (
        <BlockStack gap="500">
            <CampaignStatus shopInfo={onboardingData.shopInfo} />
            <BankingStatus shopInfo={onboardingData.shopInfo} />
        </BlockStack>
    );
}
