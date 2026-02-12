import { BlockStack, Layout } from "@shopify/polaris";
import { ConnectedShopInfo } from "app/components/ConnectedShopInfo";
import { Stepper } from "app/components/Stepper";
import { resolveMerchantInfo } from "app/services.server/merchant";
import { authenticate } from "app/shopify.server";
import type { LoaderFunctionArgs } from "react-router";
import { data, useLoaderData } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const merchantInfo = await resolveMerchantInfo(context);
    return data({ merchantInfo });
};

export default function SettingsGeneralPage() {
    const { merchantInfo } = useLoaderData<typeof loader>();

    return (
        <Layout>
            <Layout.Section>
                <BlockStack gap="500">
                    {merchantInfo && (
                        <ConnectedShopInfo merchantInfo={merchantInfo} />
                    )}
                    <Stepper redirectToApp={false} />
                </BlockStack>
            </Layout.Section>
        </Layout>
    );
}
