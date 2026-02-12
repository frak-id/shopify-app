import { Layout, Page } from "@shopify/polaris";
import { CampaignStatus } from "app/components/Campaign";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";
import type { LoaderFunctionArgs } from "react-router";
import { data, useLoaderData } from "react-router";
import { getOnchainProductInfo } from "../services.server/onchain";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const shopInfo = await getOnchainProductInfo(context);
    return data({ shopInfo });
};

export default function CampaignsPage() {
    const { shopInfo } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <Page title={t("campaigns.title")}>
            <Layout>
                <Layout.Section>
                    {shopInfo && <CampaignStatus shopInfo={shopInfo} />}
                    {!shopInfo && (
                        // TODO: Link to the settings / setup instructions
                        <p>Nope</p>
                    )}
                </Layout.Section>
            </Layout>
        </Page>
    );
}
