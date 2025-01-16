import { useRouteLoaderData } from "@remix-run/react";
import { BlockStack, Button, Card, Layout, Page, Text } from "@shopify/polaris";
import { Stepper } from "app/components/Stepper";
import { WalletGated } from "app/components/WalletGated";
import type { loader } from "app/routes/app";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * todo: Index page of the Frak application on the shopify admin panel
 *  - Login with a Frak wallet if needed
 *  - Check if a product is present, otherwise, link to product page?
 *  - Quickly check product status? Active campaign etc? And redirect to business for more infos?
 *  - Setup pixel + webhook automatically?
 *
 *
 *  todo:
 *   - theme app extensions for the frak-setup js asset? https://shopify.dev/docs/apps/build/online-store/theme-app-extensions
 * @param request
 */
export default function Index() {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const isThemeSupported = rootData?.isThemeSupported;
    const { t } = useTranslation();

    return (
        <Page
            title={t("common.title")}
            primaryAction={
                <Button
                    variant="primary"
                    url={process.env.BUSINESS_URL}
                    target="_blank"
                >
                    {t("common.goToDashboard")}
                </Button>
            }
        >
            <BlockStack gap="500">
                <Layout>
                    {!isThemeSupported && <ThemeNotSupported />}
                    {isThemeSupported && <ThemeSupported />}
                </Layout>
            </BlockStack>
        </Page>
    );
}

function ThemeNotSupported() {
    return (
        <Layout.Section>
            <Text as="p" variant="bodyMd">
                It looks like your theme does not fully support the
                functionality of this app.
            </Text>
            <Text as="p" variant="bodyMd">
                Try switching to a different theme or contacting your theme
                developer to request support.
            </Text>
        </Layout.Section>
    );
}

function ThemeSupported() {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const { t } = useTranslation();
    const [onBoarding, setOnBoarding] = useState(false);
    const isAllSet = Boolean(
        rootData?.webPixel?.id &&
            rootData?.webhooks?.edges?.length &&
            rootData?.isThemeHasFrakActivated &&
            rootData?.isThemeHasFrakButton
    );

    useEffect(() => {
        // If one step is not set, we remove the onboarding flag
        if (!isAllSet) {
            window.localStorage.removeItem("frak-onBoarding");
            return;
        }

        // If all steps are set, we set the onboarding flag
        const frakOnboarding = window.localStorage.getItem("frak-onBoarding");
        setOnBoarding(frakOnboarding === "done");
    }, [isAllSet]);

    return (
        <Layout.Section>
            <Card>
                <BlockStack gap="500">
                    <WalletGated>
                        {onBoarding ? t("common.allSet") : <Stepper />}
                    </WalletGated>
                </BlockStack>
            </Card>
        </Layout.Section>
    );
}
