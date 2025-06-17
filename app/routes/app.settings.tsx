import type { LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Layout, Page } from "@shopify/polaris";
import { ConnectedShopInfo } from "app/components/Status/ConnectedShopInfo";
import { Stepper2 } from "app/components/Stepper2";
import { useOnChainShopInfo } from "app/hooks/useOnChainShopInfo";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);
    return Response.json({});
};

export default function SettingsPage() {
    const { shopInfo, isLoading } = useOnChainShopInfo();
    const { t } = useTranslation();

    return (
        <Page title={t("settings.title")}>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        {/* Show ConnectedShopInfo only if shop is connected and has product data */}
                        {!isLoading && shopInfo?.product && (
                            <ConnectedShopInfo product={shopInfo.product} />
                        )}

                        {/* Always show the Stepper2 component */}
                        <Stepper2 />
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
