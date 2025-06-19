import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Layout } from "@shopify/polaris";
import { ConnectedShopInfo } from "app/components/ConnectedShopInfo";
import { Stepper } from "app/components/Stepper";
import { authenticate } from "app/shopify.server";
import { getOnchainProductInfo } from "../services.server/onchain";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const shopInfo = await getOnchainProductInfo(context);
    return Response.json({ shopInfo });
};

export default function SettingsGeneralPage() {
    const { shopInfo } = useLoaderData<typeof loader>();

    return (
        <Layout>
            <Layout.Section>
                <BlockStack gap="500">
                    {shopInfo?.product && (
                        <ConnectedShopInfo product={shopInfo.product} />
                    )}

                    <Stepper redirectToApp={false} />
                </BlockStack>
            </Layout.Section>
        </Layout>
    );
}
