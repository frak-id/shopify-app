import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Badge, BlockStack, Box, Card, Text } from "@shopify/polaris";
import { CheckIcon, XSmallIcon } from "@shopify/polaris-icons";
import { type IntentWebPixel, Pixel } from "app/components/Pixel";
import {
    createWebPixel,
    deleteWebPixel,
    getWebPixel,
} from "app/services.server/webPixel";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);

    // If no pixel is found, graphql will throw an error
    try {
        return await getWebPixel(context);
    } catch (error) {
        console.error(error);
        return null;
    }
};

export async function action({ request }: ActionFunctionArgs) {
    const context = await authenticate.admin(request);
    const formData = await request.formData();
    const intent = formData.get("intent") as IntentWebPixel;

    switch (intent) {
        case "createWebPixel": {
            return createWebPixel(context);
        }

        case "deleteWebPixel": {
            const webPixel = await getWebPixel(context);
            return deleteWebPixel({ ...context, id: webPixel.id });
        }
    }
}

export default function SettingsPixelPage() {
    const webPixel = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <BlockStack gap="500">
            <Card>
                <BlockStack gap="200">
                    <Box paddingBlockStart={"200"} paddingBlockEnd={"200"}>
                        {webPixel && (
                            <Badge tone="success" icon={CheckIcon}>
                                {t("pixel.connected")}
                            </Badge>
                        )}
                        {!webPixel && (
                            <Badge tone="critical" icon={XSmallIcon}>
                                {t("pixel.notConnected")}
                            </Badge>
                        )}
                    </Box>
                    <Text as="p" variant="bodyMd">
                        {!webPixel && t("pixel.needConnection")}
                    </Text>
                    <Text as="p" variant="bodyMd">
                        <Pixel id={webPixel?.id} />
                    </Text>
                </BlockStack>
            </Card>
        </BlockStack>
    );
}
