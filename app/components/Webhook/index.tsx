import { useFetcher, useRouteLoaderData } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Button } from "@shopify/polaris";
import type { loader } from "app/routes/app";
import type {
    CreateWebhookSubscriptionReturnType,
    DeleteWebhookSubscriptionReturnType,
} from "app/services.server/webhook";
import { productIdFromDomain } from "app/utils/productIdFromDomain";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export type IntentWebhook = "createWebhook" | "deleteWebhook";

export function Webhook({ id }: { id?: string }) {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
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
