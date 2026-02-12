import { useDisplayModal, useWalletStatus } from "@frak-labs/react-sdk";
import {
    Banner,
    Button,
    Card,
    EmptyState,
    InlineStack,
    Page,
    Spinner,
    Text,
} from "@shopify/polaris";
import type { loader } from "app/routes/app";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router";
import LogoFrak from "../../assets/LogoFrak.svg";

export function WalletGated({ children }: { children: ReactNode }) {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const url = rootData?.shop?.url;
    const { data: walletStatus } = useWalletStatus();
    const { mutate: displayFrakModal } = useDisplayModal();
    const { t } = useTranslation();
    const [showTimeoutError, setShowTimeoutError] = useState(false);

    useEffect(() => {
        if (walletStatus === undefined) {
            const timeoutId = setTimeout(
                () => setShowTimeoutError(true),
                10000
            );

            return () => clearTimeout(timeoutId);
        }
        setShowTimeoutError(false);
    }, [walletStatus]);

    const authenticate = useCallback(() => {
        displayFrakModal({
            steps: {
                login: {
                    allowSso: true,
                    ssoMetadata: {
                        homepageLink: url,
                    },
                },
            },
        });
    }, [displayFrakModal, url]);

    if (walletStatus === undefined) {
        return (
            <Page>
                <InlineStack gap="200" blockAlign="center" direction="row">
                    {!showTimeoutError && (
                        <InlineStack gap="200" blockAlign="center">
                            <Spinner size="small" />
                            <Text variant="headingMd" as="h2">
                                {t("common.loading")}
                            </Text>
                        </InlineStack>
                    )}
                    {showTimeoutError && (
                        <Banner tone="critical">
                            <p>{t("common.loadingTimeout")}</p>
                        </Banner>
                    )}
                </InlineStack>
            </Page>
        );
    }

    if (!walletStatus.wallet) {
        return (
            <Page>
                <Card>
                    <EmptyState
                        heading={t("gated.configure")}
                        action={{
                            content: t("gated.create"),
                            onAction: authenticate,
                        }}
                        footerContent={
                            <p>
                                <Button
                                    variant="monochromePlain"
                                    onClick={authenticate}
                                >
                                    {t("gated.alreadyGotAnAccount")}
                                </Button>
                                .
                            </p>
                        }
                        image={LogoFrak}
                    >
                        <p>{t("gated.start")}</p>
                    </EmptyState>
                </Card>
            </Page>
        );
    }

    return <>{children}</>;
}
