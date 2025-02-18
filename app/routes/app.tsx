import { useWalletStatus } from "@frak-labs/react-sdk";
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { WalletGated } from "app/components/WalletGated";
import { shopInfo } from "app/services.server/shop";
import { doesThemeSupportBlock } from "app/services.server/theme";
import { useTranslation } from "react-i18next";
import { RootProvider } from "../providers/RootProvider";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const [isThemeSupported, shop] = await Promise.all([
        doesThemeSupportBlock(context),
        shopInfo(context),
    ]);

    return {
        apiKey: process.env.SHOPIFY_API_KEY || "",
        isThemeSupported,
        shop,
    };
};

export default function App() {
    const { apiKey } = useLoaderData<typeof loader>();

    return (
        <AppProvider isEmbeddedApp apiKey={apiKey}>
            <RootProvider>
                <Navigation />
                <WalletGated>
                    <Outlet />
                </WalletGated>
            </RootProvider>
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
function Navigation() {
    const { isThemeSupported } = useLoaderData<typeof loader>();
    const { data: walletStatus } = useWalletStatus();
    const { t } = useTranslation();

    return (
        <NavMenu>
            <Link to="/app" rel="home">
                Home
            </Link>
            {isThemeSupported && walletStatus?.wallet && (
                <>
                    <Link to="/app/pixel">{t("navigation.pixel")}</Link>
                    <Link to="/app/webhook">{t("navigation.webhook")}</Link>
                    <Link to="/app/theme">{t("navigation.theme")}</Link>
                    <Link to="/app/button">{t("navigation.button")}</Link>
                    <Link to="/app/walletbutton">
                        {t("navigation.buttonWallet")}
                    </Link>
                </>
            )}
        </NavMenu>
    );
}
