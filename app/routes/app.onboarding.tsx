import { Page } from "@shopify/polaris";
import { Stepper2 } from "app/components/Stepper2";
import { useTranslation } from "react-i18next";

export default function OnBoardingPage() {
    const { t } = useTranslation();

    return (
        <Page title={t("common.title")}>
            <Stepper2 />
        </Page>
    );
}
