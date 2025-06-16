import { useWalletStatus } from "@frak-labs/react-sdk";
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
    Await,
    Link,
    Outlet,
    defer,
    useLoaderData,
    useRouteError,
} from "@remix-run/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { WalletGated } from "app/components/WalletGated";
import { shopInfo } from "app/services.server/shop";
import { doesThemeSupportBlock } from "app/services.server/theme";
import {
    type OnboardingStepData,
    fetchAllOnboardingData,
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

    return defer({
        apiKey: process.env.SHOPIFY_API_KEY || "",
        isThemeSupportedPromise: doesThemeSupportBlock(context),
        shop,
        onboardingDataPromise: fetchAllOnboardingData(context),
    });
};

export default function App() {
    const { apiKey, isThemeSupportedPromise, onboardingDataPromise } =
        useLoaderData<typeof loader>();

    return (
        <AppProvider isEmbeddedApp apiKey={apiKey}>
            <Suspense>
                <Await resolve={isThemeSupportedPromise}>
                    {(isThemeSupported) => {
                        return (
                            <RootProvider>
                                <Navigation
                                    isThemeSupported={isThemeSupported}
                                    onboardingDataPromise={
                                        onboardingDataPromise
                                    }
                                />
                                <WalletGated>
                                    <Outlet />
                                </WalletGated>
                            </RootProvider>
                        );
                    }}
                </Await>
            </Suspense>
        </AppProvider>
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
                            if (!validationResult.isComplete) return null;
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
            <Link to="/app/pixel">{t("navigation.pixel")}</Link>
            <Link to="/app/webhook">{t("navigation.webhook")}</Link>
            <Link to="/app/theme">{t("navigation.theme")}</Link>
            <Link to="/app/button">{t("navigation.button")}</Link>
            <Link to="/app/walletbutton">{t("navigation.buttonWallet")}</Link>
            <Link to="/app/customizations">
                {t("navigation.customizations")}
            </Link>
            <Link to="/app/status">{t("navigation.status")}</Link>
        </>
    );
}
