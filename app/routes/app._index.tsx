import type { loader as appLoader } from "app/routes/app";
import {
    getOnboardingStatusMessage,
    type OnboardingStepData,
    validateCompleteOnboarding,
} from "app/utils/onboarding";
import { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { LoaderFunctionArgs } from "react-router";
import {
    Await,
    data,
    useLoaderData,
    useNavigate,
    useRouteLoaderData,
} from "react-router";
import { CampaignStatus } from "../components/Campaign";
import { BankingStatus } from "../components/Funding/Bank";
import {
    getMerchantBankStatus,
    getMerchantCampaigns,
} from "../services.server/backendMerchant";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const [campaigns, bankStatus] = await Promise.all([
        getMerchantCampaigns(context, request),
        getMerchantBankStatus(context, request),
    ]);
    return data({ campaigns, bankStatus });
};

export default function Index() {
    const rootData = useRouteLoaderData<typeof appLoader>("routes/app");
    const isThemeSupportedPromise = rootData?.isThemeSupportedPromise;
    const onboardingDataPromise = rootData?.onboardingDataPromise;
    const { t } = useTranslation();

    return (
        <s-page heading={t("common.title")}>
            <s-button
                slot="primary-action"
                variant="primary"
                href={process.env.BUSINESS_URL}
                target="_blank"
            >
                {t("common.goToDashboard")}
            </s-button>
            <s-stack gap="large">
                <Suspense>
                    <Await resolve={isThemeSupportedPromise}>
                        {(isThemeSupported) => {
                            return (
                                <>
                                    {!isThemeSupported && <ThemeNotSupported />}
                                    {isThemeSupported && (
                                        <Await resolve={onboardingDataPromise}>
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
            </s-stack>
        </s-page>
    );
}

function ThemeNotSupported() {
    return (
        <>
            <s-text>
                It looks like your theme does not fully support the
                functionality of this app.
            </s-text>
            <s-text>
                Try switching to a different theme or contacting your theme
                developer to request support.
            </s-text>
        </>
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
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to onboarding if onboarding is not complete
        if (!validationResult.isComplete) {
            navigate("/app/onboarding");
        }
    }, [navigate, validationResult.isComplete]);

    return (
        <s-stack gap="large">
            {/* Show validation status banner if onboarding is marked complete locally but validation fails */}
            {!validationResult.isComplete && (
                <s-section>
                    <s-banner tone="warning">
                        <s-text>{statusMessage}</s-text>
                        <s-text>
                            Please complete the missing steps to activate all
                            features.
                        </s-text>
                        <s-link href="/app/onboarding">
                            {t("common.getStarted")}
                        </s-link>
                    </s-banner>
                </s-section>
            )}
            <OnBoardingComplete onboardingData={onboardingData} />
        </s-stack>
    );
}

function OnBoardingComplete({
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    const { campaigns, bankStatus } = useLoaderData<typeof loader>();

    if (!onboardingData.merchantId || !campaigns || !bankStatus) {
        return null;
    }

    return (
        <s-stack gap="large">
            <CampaignStatus campaigns={campaigns} bankStatus={bankStatus} />
            <BankingStatus bankStatus={bankStatus} />
        </s-stack>
    );
}
