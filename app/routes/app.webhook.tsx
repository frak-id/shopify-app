import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    Badge,
    BlockStack,
    Box,
    Card,
    Layout,
    Page,
    Text,
} from "@shopify/polaris";
import { CheckIcon, XSmallIcon } from "@shopify/polaris-icons";
import {
    FrakWebhook,
    type IntentWebhook,
    ShopifyWebhook,
} from "app/components/Webhook";
import { shopInfo } from "app/services.server/shop";
import {
    createWebhook,
    deleteWebhook,
    frakWebhookStatus,
    getWebhooks,
} from "app/services.server/webhook";
import { productIdFromDomain } from "app/utils/productIdFromDomain";
import { useTranslation } from "react-i18next";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const shop = await shopInfo(context);
    const productId = productIdFromDomain(shop.domain);
    const frakWebhook = await frakWebhookStatus({
        productId: String(productId),
    });
    const webhooks = await getWebhooks(context);
    return { webhooks, frakWebhook, productId };
};

export async function action({ request }: ActionFunctionArgs) {
    const context = await authenticate.admin(request);
    const formData = await request.formData();
    const intent = formData.get("intent") as IntentWebhook;

    switch (intent) {
        case "createWebhook": {
            const productId = formData.get("productId");
            if (!productId)
                return { userErrors: [{ message: "productId is missing" }] };
            return createWebhook({ ...context, productId: String(productId) });
        }

        case "deleteWebhook": {
            const webhooks = await getWebhooks(context);
            if (!webhooks.edges[0]?.node?.id)
                return { userErrors: [{ message: "Webhook does not exists" }] };
            return deleteWebhook({ ...context, id: webhooks.edges[0].node.id });
        }
    }
}

export default function WebHookPage() {
    const data = useLoaderData<typeof loader>();
    const { webhooks, frakWebhook, productId } = data;
    const isWebhookExists = webhooks.edges.length > 0;
    const { t } = useTranslation();

    return (
        <Page title={t("webhook.title")}>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        <Card>
                            <BlockStack gap="200">
                                <Box
                                    paddingBlockStart={"200"}
                                    paddingBlockEnd={"200"}
                                >
                                    {isWebhookExists && (
                                        <Badge tone="success" icon={CheckIcon}>
                                            {t("webhook.connected")}
                                        </Badge>
                                    )}
                                    {!isWebhookExists && (
                                        <Badge
                                            tone="critical"
                                            icon={XSmallIcon}
                                        >
                                            {t("webhook.notConnected")}
                                        </Badge>
                                    )}
                                </Box>
                                <Text as="p" variant="bodyMd">
                                    {!isWebhookExists &&
                                        t("webhook.needConnection")}
                                </Text>
                                <Text as="p" variant="bodyMd">
                                    <ShopifyWebhook
                                        id={webhooks?.edges[0]?.node?.id}
                                    />
                                </Text>
                                <Box
                                    paddingBlockStart={"200"}
                                    paddingBlockEnd={"200"}
                                >
                                    {frakWebhook.setup && (
                                        <Badge tone="success" icon={CheckIcon}>
                                            {t("webhook.frakConnected")}
                                        </Badge>
                                    )}
                                    {!frakWebhook.setup && (
                                        <Badge
                                            tone="critical"
                                            icon={XSmallIcon}
                                        >
                                            {t("webhook.frakNotConnected")}
                                        </Badge>
                                    )}
                                </Box>
                                {!frakWebhook.setup && (
                                    <Text as="p" variant="bodyMd">
                                        {t("webhook.needFrakConnection")}
                                    </Text>
                                )}
                                <Text as="p" variant="bodyMd">
                                    <FrakWebhook
                                        setup={frakWebhook.setup}
                                        productId={productId}
                                    />
                                </Text>
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
