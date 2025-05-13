import { useFetcher, useRouteLoaderData } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Button } from "@shopify/polaris";
import { useFrakWebhookLink } from "app/hooks/useFrakWebhookLink";
import { useRefreshData } from "app/hooks/useRefreshData";
import type { loader as rootLoader } from "app/routes/app";
import type {
    CreateWebhookSubscriptionReturnType,
    DeleteWebhookSubscriptionReturnType,
} from "app/services.server/webhook";
import { productIdFromDomain } from "app/utils/productIdFromDomain";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

export type IntentWebhook = "createWebhook" | "deleteWebhook";

export function ShopifyWebhook({ id }: { id?: string }) {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const shopify = useAppBridge();
    const fetcher = useFetcher<
        | CreateWebhookSubscriptionReturnType
        | DeleteWebhookSubscriptionReturnType
    >();
    const { t } = useTranslation();

    useEffect(() => {
        if (!fetcher.data) return;

        const data = fetcher.data;
        const { userErrors } = data;
        const webhook = (data as CreateWebhookSubscriptionReturnType)
            .webhookSubscription;
        const deletedWebhookId = (data as DeleteWebhookSubscriptionReturnType)
            .deletedWebhookSubscriptionId;

        if (userErrors?.length > 0) {
            shopify.toast.show(t("webhook.actions.messages.error"), {
                isError: true,
            });
        }

        if (webhook) {
            shopify.toast.show(t("webhook.actions.messages.connect"));
        }

        if (deletedWebhookId) {
            shopify.toast.show(t("webhook.actions.messages.disconnect"));
        }
    }, [fetcher.data, shopify.toast, t]);

    const handleAction = async (intent: IntentWebhook, productId?: string) => {
        fetcher.submit(
            { intent, productId: productId ?? null },
            { method: "POST", action: "/app/webhook" }
        );
    };

    return (
        <>
            {!id && (
                <Button
                    variant="primary"
                    loading={fetcher.state !== "idle"}
                    disabled={fetcher.state !== "idle"}
                    onClick={() => {
                        if (!rootData?.shop) return;
                        const productId = productIdFromDomain(
                            rootData.shop.myshopifyDomain
                        );
                        handleAction("createWebhook", productId);
                    }}
                >
                    {t("webhook.actions.cta.connect")}
                </Button>
            )}
            {id && (
                <Button
                    variant="primary"
                    loading={fetcher.state !== "idle"}
                    disabled={fetcher.state !== "idle"}
                    onClick={() => handleAction("deleteWebhook")}
                >
                    {t("webhook.actions.cta.disconnect")}
                </Button>
            )}
        </>
    );
}

export function FrakWebhook({
    setup,
    productId,
}: { setup: boolean; productId: string }) {
    const { t } = useTranslation();

    // The webhook link
    const webhookLink = useFrakWebhookLink({
        productId,
    });

    const refresh = useRefreshData();

    // Open webhook link
    const handleSetupWebhook = useCallback(() => {
        const openedWindow = window.open(
            webhookLink,
            "frak-business",
            "menubar=no,status=no,scrollbars=no,fullscreen=no,width=500, height=800"
        );

        if (openedWindow) {
            openedWindow.focus();

            // Check every 500ms if the window is closed
            // If it is, revalidate the page
            const timer = setInterval(() => {
                if (openedWindow.closed) {
                    clearInterval(timer);
                    setTimeout(() => refresh(), 1000);
                }
            }, 500);
        }
    }, [webhookLink, refresh]);

    return (
        <>
            {!setup && (
                <Button variant="primary" onClick={handleSetupWebhook}>
                    {t("webhook.actions.cta.frakConnect")}
                </Button>
            )}
        </>
    );
}
