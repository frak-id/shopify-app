import { Page } from "@shopify/polaris";
import { Stepper } from "app/components/Stepper";
import { clearMerchantCache } from "app/services.server/merchant";
import { useTranslation } from "react-i18next";
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
    const context = await authenticate.admin(request);
    const formData = await request.formData();
    const intent = formData.get("intent");

    switch (intent) {
        case "clearCache": {
            await clearMerchantCache(context);
            return { success: true };
        }
        default: {
            return { success: false, error: "Invalid intent" };
        }
    }
}

export default function OnBoardingPage() {
    const { t } = useTranslation();

    return (
        <Page title={t("common.title")}>
            <Stepper redirectToApp={true} />
        </Page>
    );
}
