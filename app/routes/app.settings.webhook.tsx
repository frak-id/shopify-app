import { Badge, BlockStack, Box, Card, Text } from "@shopify/polaris";
import { CheckIcon, XSmallIcon } from "@shopify/polaris-icons";
import {
    CreateShopifyWebhook,
    FrakWebhook,
    type IntentWebhook,
    WebhookList,
} from "app/components/Webhook";
import { resolveMerchantId } from "app/services.server/merchant";
import {
    createWebhook,
    deleteWebhook,
    frakWebhookStatus,
    getWebhooks,
} from "app/services.server/webhook";
import { useTranslation } from "react-i18next";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const merchantId = await resolveMerchantId(context);
    const frakWebhook = await frakWebhookStatus({
        merchantId,
    });
    const webhooks = await getWebhooks(context);
    return { webhooks, frakWebhook, merchantId };
};

export async function action({ request }: ActionFunctionArgs) {
    const context = await authenticate.admin(request);
    const formData = await request.formData();
    const intent = formData.get("intent") as IntentWebhook;

    switch (intent) {
        case "createWebhook": {
            return await createWebhook(context);
        }

        case "deleteWebhook": {
            const webhookId = formData.get("webhookId");
            if (webhookId) {
                // Delete specific webhook by ID
                return await deleteWebhook({
                    ...context,
                    id: String(webhookId),
                });
            }
            // Delete first webhook (legacy behavior)
            const webhooks = await getWebhooks(context);
            if (!webhooks[0]?.node?.id)
                return { userErrors: [{ message: "Webhook does not exists" }] };
            return await deleteWebhook({ ...context, id: webhooks[0].node.id });
        }
    }
}

export default function SettingsWebhookPage() {
    const data = useLoaderData<typeof loader>();
    const { webhooks, frakWebhook, merchantId } = data;
    const isWebhookExists = webhooks.length > 0;
    const { t } = useTranslation();

    return (
        <BlockStack gap="500">
            <Card>
                <BlockStack gap="200">
                    <Box paddingBlockStart={"200"} paddingBlockEnd={"200"}>
                        {isWebhookExists && (
                            <Badge tone="success" icon={CheckIcon}>
                                {t("webhook.connected")}
                            </Badge>
                        )}
                        {!isWebhookExists && (
                            <Badge tone="critical" icon={XSmallIcon}>
                                {t("webhook.notConnected")}
                            </Badge>
                        )}
                    </Box>
                    <Text as="p" variant="bodyMd">
                        {!isWebhookExists && t("webhook.needConnection")}
                    </Text>
                    {!isWebhookExists && (
                        <Text as="p" variant="bodyMd">
                            <CreateShopifyWebhook />
                        </Text>
                    )}

                    {/* Display all webhooks */}
                    <WebhookList webhooks={webhooks} />

                    <Box paddingBlockStart={"200"} paddingBlockEnd={"200"}>
                        {frakWebhook.setup && (
                            <Badge tone="success" icon={CheckIcon}>
                                {t("webhook.frakConnected")}
                            </Badge>
                        )}
                        {!frakWebhook.setup && (
                            <Badge tone="critical" icon={XSmallIcon}>
                                {t("webhook.frakNotConnected")}
                            </Badge>
                        )}
                    </Box>
                    {!frakWebhook.setup && (
                        <Text as="p" variant="bodyMd">
                            {t("webhook.needFrakConnection")}
                        </Text>
                    )}
                    {merchantId && (
                        <Text as="p" variant="bodyMd">
                            <FrakWebhook
                                setup={frakWebhook.setup}
                                merchantId={merchantId}
                            />
                        </Text>
                    )}
                </BlockStack>
            </Card>
        </BlockStack>
    );
}
