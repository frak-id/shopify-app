import { useWalletStatus } from "@frak-labs/react-sdk";
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
    Await,
    Link,
    Outlet,
    useLoaderData,
    useNavigation,
    useRouteError,
} from "@remix-run/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { Skeleton } from "app/components/Skeleton";
import { WalletGated } from "app/components/WalletGated";
import { shopInfo } from "app/services.server/shop";
import { doesThemeSupportBlock } from "app/services.server/theme";
import {
    fetchAllOnboardingData,
    type OnboardingStepData,
    validateCompleteOnboarding,
} from "app/utils/onboarding";
import { type ReactNode, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { RootProvider } from "../providers/RootProvider";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const [shop] = await Promise.all([shopInfo(context)]);

    return {
        apiKey: process.env.SHOPIFY_API_KEY || "",
        isThemeSupportedPromise: doesThemeSupportBlock(context),
        shop,
        onboardingDataPromise: fetchAllOnboardingData(context),
    };
};

export default function App() {
    const { apiKey, isThemeSupportedPromise, onboardingDataPromise } =
        useLoaderData<typeof loader>();

    return (
        <AppProvider isEmbeddedApp apiKey={apiKey}>
            <RootProvider>
                <Suspense>
                    <AppContent
                        isThemeSupportedPromise={isThemeSupportedPromise}
                        onboardingDataPromise={onboardingDataPromise}
                    />
                </Suspense>
            </RootProvider>
        </AppProvider>
    );
}

function AppContent({
    isThemeSupportedPromise,
    onboardingDataPromise,
}: {
    isThemeSupportedPromise: Promise<boolean>;
    onboardingDataPromise: Promise<OnboardingStepData>;
}) {
    const navigation = useNavigation();
    const isLoading =
        navigation.state === "loading" || navigation.state === "submitting";

    return (
        <Await resolve={isThemeSupportedPromise}>
            {(isThemeSupported) => {
                return (
                    <>
                        <Navigation
                            isThemeSupported={isThemeSupported}
                            onboardingDataPromise={onboardingDataPromise}
                        />
                        <WalletGated>
                            {isLoading ? <Skeleton /> : <Outlet />}
                        </WalletGated>
                    </>
                );
            }}
        </Await>
    );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
    return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
    return boundary.headers(headersArgs);
};

/**
 * Show the navigation menu only if theme supports the block and wallet is connected
 * @param isThemeSupported
 */
function Navigation({
    isThemeSupported,
    onboardingDataPromise,
}: {
    isThemeSupported: boolean;
    onboardingDataPromise: Promise<OnboardingStepData>;
}) {
    const { data: walletStatus } = useWalletStatus();

    return (
        <NavigationRoot>
            {isThemeSupported && walletStatus?.wallet && (
                <Suspense>
                    <Await resolve={onboardingDataPromise}>
                        {(onboardingData) => {
                            const validationResult =
                                validateCompleteOnboarding(onboardingData);
                            if (validationResult.hasMissedCriticalSteps)
                                return null;
                            return <NavigationContent />;
                        }}
                    </Await>
                </Suspense>
            )}
        </NavigationRoot>
    );
}

function NavigationRoot({ children }: { children: ReactNode }) {
    return (
        <NavMenu>
            <Link to="/app" rel="home">
                Home
            </Link>
            {children}
        </NavMenu>
    );
}

function NavigationContent() {
    const { t } = useTranslation();

    return (
        <>
            <Link to="/app/campaigns">{t("navigation.campaigns")}</Link>
            <Link to="/app/appearance">{t("navigation.appearance")}</Link>
            <Link to="/app/funding">{t("navigation.funding")}</Link>
            <Link to="/app/settings/general">
                {t("navigation.settings.title")}
            </Link>
        </>
    );
}
