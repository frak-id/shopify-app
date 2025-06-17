import { useRouteLoaderData } from "@remix-run/react";
import { Button, Text } from "@shopify/polaris";
import type { loader as rootLoader } from "app/routes/app";
import type { OnboardingStepData } from "app/utils/onboarding";
import { useTranslation } from "react-i18next";
import { StepItem } from ".";

export function Step6({
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    const { isThemeHasFrakButton, themeWalletButton, firstProduct } =
        onboardingData;
    const { t } = useTranslation();
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const editorUrl = `https://${rootData?.shop?.myshopifyDomain}/admin/themes/current/editor`;

    return (
        <StepItem checked={!!(isThemeHasFrakButton || themeWalletButton)}>
            <Text variant="bodyMd" as="p">
                {t("stepper2.step6.title")}
            </Text>
            {!isThemeHasFrakButton && firstProduct && (
                <Button
                    variant="primary"
                    url={`${editorUrl}?previewPath=/products/${firstProduct.handle}`}
                    target="_blank"
                >
                    {t("stepper2.step6.link")}
                </Button>
            )}
            {!!themeWalletButton && (
                <Button
                    variant="primary"
                    url={`${editorUrl}?context=apps`}
                    target="_blank"
                >
                    {t("appearance.walletButton.link")}
                </Button>
            )}
        </StepItem>
    );
}
