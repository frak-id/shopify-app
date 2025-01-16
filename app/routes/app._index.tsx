import { useNavigate, useRouteLoaderData } from "@remix-run/react";
import {
    BlockStack,
    Button,
    Card,
    Layout,
    Link,
    Page,
    Text,
} from "@shopify/polaris";
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
    const { t } = useTranslation();
    const [onBoarding, setOnBoarding] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const frakOnboarding = window.localStorage.getItem("frak-onBoarding");
        setOnBoarding(frakOnboarding === "done");

        if (frakOnboarding !== "done") {
            navigate("/app/onboarding/step1");
        }
    }, [navigate]);

    return (
        <Layout.Section>
            <Card>
                <BlockStack gap="500">
                    {onBoarding ? (
                        t("common.allSet")
                    ) : (
                        <Link url="/app/onboarding/step1">
                            {t("common.getStarted")}
                        </Link>
                    )}
                </BlockStack>
            </Card>
        </Layout.Section>
    );
}
