import { useRouteLoaderData } from "@remix-run/react";
import { BlockStack, Button, Grid, Text } from "@shopify/polaris";
import type { loader as rootLoader } from "app/routes/app";
import {
    type OnboardingStepData,
    validateCompleteOnboarding,
} from "app/utils/onboarding";
import { Trans, useTranslation } from "react-i18next";
import screenShareButton from "../../assets/share-button.png";
import screenWalletButton from "../../assets/wallet-button.png";
import { CollapsibleStep } from "./CollapsibleStep";

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
    const isThemeWalletButtonExist = !!themeWalletButton;
    const isCompleted = !!(isThemeHasFrakButton || themeWalletButton);
    const { failedSteps } = validateCompleteOnboarding(onboardingData);

    return (
        <CollapsibleStep
            step={6}
            currentStep={failedSteps[0]}
            completed={isCompleted}
            title={t("stepper.step6.title")}
        >
            <Grid>
                {!isThemeHasFrakButton && firstProduct && (
                    <Grid.Cell
                        columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
                    >
                        <BlockStack gap="400">
                            <Text as="p" variant="bodyMd">
                                <Trans i18nKey="stepper.step6.descriptionShare" />
                            </Text>
                            <img src={screenShareButton} alt="" />
                            <Button
                                variant="primary"
                                url={`${editorUrl}?previewPath=/products/${firstProduct.handle}`}
                                target="_blank"
                            >
                                {t("stepper.step6.linkShare")}
                            </Button>
                        </BlockStack>
                    </Grid.Cell>
                )}
                {!isThemeWalletButtonExist && (
                    <Grid.Cell
                        columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
                    >
                        <BlockStack gap="400">
                            <Text as="p" variant="bodyMd">
                                <Trans i18nKey="stepper.step6.descriptionWallet" />
                            </Text>
                            <img src={screenWalletButton} alt="" />
                            <Button
                                variant="primary"
                                url={`${editorUrl}?context=apps`}
                                target="_blank"
                            >
                                {t("stepper.step6.linkWallet")}
                            </Button>
                        </BlockStack>
                    </Grid.Cell>
                )}
            </Grid>
        </CollapsibleStep>
    );
}
