import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Card, Page, Text } from "@shopify/polaris";
import { type IntentWebPixel, Pixel } from "app/components/Pixel";
import { useTranslation } from "react-i18next";
import {
    createWebPixel,
    deleteWebPixel,
    getWebPixel,
} from "../services.server/webPixel";
import { authenticate } from "../shopify.server";

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

export default function PixelPage() {
    const webPixel = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    return (
        <Page title={t("pixel.title")}>
            <BlockStack gap="500">
                <Card>
                    <BlockStack gap="200">
                        <Text as="p" variant="bodyMd">
                            {webPixel
                                ? t("pixel.connected")
                                : t("pixel.notConnected")}
                        </Text>
                        <Text as="p" variant="bodyMd">
                            {!webPixel && t("pixel.needConnection")}
                        </Text>
                        <Text as="p" variant="bodyMd">
                            <Pixel id={webPixel?.id} />
                        </Text>
                    </BlockStack>
                </Card>
            </BlockStack>
        </Page>
    );
}
