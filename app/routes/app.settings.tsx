import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Layout, Page } from "@shopify/polaris";
import { ConnectedShopInfo } from "app/components/ConnectedShopInfo";
import { Stepper2 } from "app/components/Stepper2";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";
import { getOnchainProductInfo } from "../services.server/onchain";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const shopInfo = await getOnchainProductInfo(context);
    return Response.json({ shopInfo });
};

export default function SettingsPage() {
    const { shopInfo } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <Page title={t("settings.title")}>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        {/* Show ConnectedShopInfo only if shop is connected and has product data */}
                        {shopInfo?.product && (
                            <ConnectedShopInfo product={shopInfo.product} />
                        )}

                        {/* Always show the Stepper2 component */}
                        <Stepper2 redirectToApp={false} />
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
