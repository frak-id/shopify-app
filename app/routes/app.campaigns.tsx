import { Layout, Page } from "@shopify/polaris";
import { CampaignStatus } from "app/components/Campaign";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";
import type { LoaderFunctionArgs } from "react-router";
import { data, useLoaderData } from "react-router";
import {
    getMerchantBankStatus,
    getMerchantCampaigns,
} from "../services.server/backendMerchant";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const [campaigns, bankStatus] = await Promise.all([
        getMerchantCampaigns(context, request),
        getMerchantBankStatus(context, request),
    ]);
    return data({ campaigns, bankStatus });
};

export default function CampaignsPage() {
    const { campaigns, bankStatus } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <Page title={t("campaigns.title")}>
            <Layout>
                <Layout.Section>
                    {campaigns && bankStatus ? (
                        <CampaignStatus
                            campaigns={campaigns}
                            bankStatus={bankStatus}
                        />
                    ) : (
                        // TODO: Link to the settings / setup instructions
                        <p>Nope</p>
                    )}
                </Layout.Section>
            </Layout>
        </Page>
    );
}
