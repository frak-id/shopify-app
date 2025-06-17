import type { LoaderFunctionArgs } from "@remix-run/node";
import { Layout, Page, Spinner } from "@shopify/polaris";
import { CampaignStatus } from "app/components/Status/Campaign";
import { useOnChainShopInfo } from "app/hooks/useOnChainShopInfo";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);
    return Response.json({});
};

export default function CampaignsPage() {
    const { shopInfo, isLoading } = useOnChainShopInfo();
    const { t } = useTranslation();

    return (
        <Page title={t("campaigns.title")}>
            <Layout>
                <Layout.Section>
                    {isLoading && <Spinner size="large" />}
                    {shopInfo && <CampaignStatus shopInfo={shopInfo} />}
                    {!isLoading && !shopInfo && (
                        // TODO: Link to the settings / setup instructions
                        <p>Nope</p>
                    )}
                </Layout.Section>
            </Layout>
        </Page>
    );
}
