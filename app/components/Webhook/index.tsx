import { useAppBridge } from "@shopify/app-bridge-react";
import { BlockStack, Button, Card, InlineStack, Text } from "@shopify/polaris";
import { useFrakWebhookLink } from "app/hooks/useFrakWebhookLink";
import { useRefreshData } from "app/hooks/useRefreshData";
import type {
    CreateWebhookSubscriptionReturnType,
    DeleteWebhookSubscriptionReturnType,
    GetWebhooksSubscriptionsReturnType,
} from "app/services.server/webhook";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

export type IntentWebhook = "createWebhook" | "deleteWebhook";

export function CreateShopifyWebhook() {
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

    const handleAction = async (intent: IntentWebhook) => {
        fetcher.submit(
            { intent },
            { method: "POST", action: "/app/settings/webhook" }
        );
    };

    return (
        <Button
            variant="primary"
            loading={fetcher.state !== "idle"}
            disabled={fetcher.state !== "idle"}
            onClick={() => {
                handleAction("createWebhook");
            }}
        >
            {t("webhook.actions.cta.connect")}
        </Button>
    );
}

export function FrakWebhook({
    setup,
    merchantId,
}: {
    setup: boolean;
    merchantId: string;
}) {
    const { t } = useTranslation();

    // The webhook link
    const webhookLink = useFrakWebhookLink({
        merchantId,
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

export function WebhookList({
    webhooks,
}: {
    webhooks: GetWebhooksSubscriptionsReturnType["edges"];
}) {
    const { t } = useTranslation();
    const shopify = useAppBridge();
    const fetcher = useFetcher<DeleteWebhookSubscriptionReturnType>();

    useEffect(() => {
        if (!fetcher.data) return;

        const data = fetcher.data;
        const { userErrors } = data;
        const deletedWebhookId = data.deletedWebhookSubscriptionId;

        if (userErrors?.length > 0) {
            shopify.toast.show(t("webhook.actions.messages.error"), {
                isError: true,
            });
        }

        if (deletedWebhookId) {
            shopify.toast.show(t("webhook.actions.messages.disconnect"));
        }
    }, [fetcher.data, shopify.toast, t]);

    const handleDeleteWebhook = (webhookId: string) => {
        fetcher.submit(
            { intent: "deleteWebhook", webhookId },
            { method: "POST", action: "/app/settings/webhook" }
        );
    };

    if (webhooks.length === 0) {
        return (
            <Text as="p" variant="bodyMd" tone="subdued">
                {t("webhook.noWebhooks")}
            </Text>
        );
    }

    return (
        <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
                {t("webhook.list.title")}
            </Text>
            {webhooks.map(({ node }) => (
                <Card key={node.id}>
                    <BlockStack gap="200">
                        <Text as="p" variant="bodyMd">
                            <strong>{t("webhook.list.topic")}:</strong>{" "}
                            {node.topic}
                        </Text>
                        <Text as="p" variant="bodyMd">
                            <strong>{t("webhook.list.endpoint")}:</strong>{" "}
                            {node.endpoint.callbackUrl ||
                                t("webhook.list.noEndpoint")}
                        </Text>
                        <InlineStack align="end">
                            <Button
                                variant="primary"
                                tone="critical"
                                size="slim"
                                loading={fetcher.state !== "idle"}
                                disabled={fetcher.state !== "idle"}
                                onClick={() => handleDeleteWebhook(node.id)}
                            >
                                {t("webhook.actions.cta.delete")}
                            </Button>
                        </InlineStack>
                    </BlockStack>
                </Card>
            ))}
        </BlockStack>
    );
}
