import { useWalletStatus } from "@frak-labs/react-sdk";
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { firstProductPublished, shopInfo } from "app/services.server/shop";
import {
    doesThemeHasFrakActivated,
    doesThemeHasFrakButton,
    doesThemeSupportBlock,
    getMainThemeId,
} from "app/services.server/theme";
import { getWebPixel } from "app/services.server/webPixel";
import { getWebhooks } from "app/services.server/webhook";
import { useTranslation } from "react-i18next";
import { RootProvider } from "../providers/RootProvider";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);

    const [
        isThemeSupported,
        isThemeHasFrakActivated,
        isThemeHasFrakButton,
        theme,
        firstProduct,
        shop,
        webhooks,
    ] = await Promise.all([
        doesThemeSupportBlock(context),
        doesThemeHasFrakActivated(context),
        doesThemeHasFrakButton(context),
        getMainThemeId(context.admin.graphql),
        firstProductPublished(context),
        shopInfo(context),
        getWebhooks(context),
    ]);

    let webPixel = null;
    try {
        webPixel = await getWebPixel(context);
    } catch (error) {
        console.error(error);
    }

    return {
        apiKey: process.env.SHOPIFY_API_KEY || "",
        theme,
        isThemeSupported,
        isThemeHasFrakActivated,
        isThemeHasFrakButton,
        shop,
        firstProduct,
        webPixel,
        webhooks,
    };
};

export default function App() {
    const { apiKey, isThemeSupported } = useLoaderData<typeof loader>();

    return (
        <AppProvider isEmbeddedApp apiKey={apiKey}>
            <RootProvider>
                <Navigation isThemeSupported={isThemeSupported} />
                <Outlet />
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
function Navigation({ isThemeSupported }: { isThemeSupported: boolean }) {
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
                </>
            )}
        </NavMenu>
    );
}
