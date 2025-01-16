import { useDisplayModal, useWalletStatus } from "@frak-labs/react-sdk";
import { useRouteLoaderData } from "@remix-run/react";
import {
    Button,
    EmptyState,
    InlineStack,
    Spinner,
    Text,
} from "@shopify/polaris";
import type { loader } from "app/routes/app";
import { type ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import LogoFrak from "../../assets/LogoFrak.svg";

export function WalletGated({ children }: { children: ReactNode }) {
    const rootData = useRouteLoaderData<typeof loader>("routes/app");
    const url = rootData?.shop?.url;
    const { data: walletStatus } = useWalletStatus();
    const { mutate: displayFrakModal } = useDisplayModal();
    const { t } = useTranslation();

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
            <InlineStack gap="200" blockAlign="center">
                <Spinner size="small" />
                <Text variant="headingMd" as="h2">
                    {t("common.loading")}
                </Text>
            </InlineStack>
        );
    }

    if (!walletStatus.wallet) {
        return (
            <EmptyState
                heading={t("gated.configure")}
                action={{ content: t("gated.create"), onAction: authenticate }}
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
        );
    }

    return <>{children}</>;
}
