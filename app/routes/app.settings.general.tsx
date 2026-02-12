import { BlockStack, Layout } from "@shopify/polaris";
import { ConnectedShopInfo } from "app/components/ConnectedShopInfo";
import { Stepper } from "app/components/Stepper";
import { authenticate } from "app/shopify.server";
import type { LoaderFunctionArgs } from "react-router";
import { data, useLoaderData } from "react-router";
import { getOnchainProductInfo } from "../services.server/onchain";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const shopInfo = await getOnchainProductInfo(context);
    return data({ shopInfo });
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
