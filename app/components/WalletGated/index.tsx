import { useDisplayModal, useWalletStatus } from "@frak-labs/react-sdk";
import { useLoaderData } from "@remix-run/react";
import {
    BlockStack,
    Button,
    EmptyState,
    InlineStack,
    Spinner,
    Text,
} from "@shopify/polaris";
import type { loader } from "app/routes/app._index";
import { type ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import LogoFrak from "../../assets/LogoFrak.svg";

export function WalletGated({ children }: { children: ReactNode }) {
    return (
        <BlockStack gap="200">
            <WalletGatedInner>{children}</WalletGatedInner>
        </BlockStack>
    );
}

function WalletGatedInner({ children }: { children: ReactNode }) {
    const {
        shop: { url },
    } = useLoaderData<typeof loader>();
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
