import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { Badge, Box, Link, Text } from "@shopify/polaris";
import { CheckIcon, XSmallIcon } from "@shopify/polaris-icons";
import type { loader as rootLoader } from "app/routes/app";
import type { loader } from "app/routes/app.onboarding.$step";
import type { FirstProductPublishedReturnType } from "app/services.server/shop";
import { useTranslation } from "react-i18next";
import screenShareButton from "../../assets/share-button.png";
import screenWalletButton from "../../assets/wallet-button.png";
import { Collapsible } from "../Collapsible";

export function Step5() {
    const data = useLoaderData<typeof loader>();
    const { isThemeHasFrakButton, themeWalletButton } = data || {};
    const { t } = useTranslation();

    return (
        <Box padding={"600"}>
            <Text as="h2" variant="headingXl">
                {t("stepper.step5.title")}
            </Text>
            <Box paddingBlockStart={"200"}>
                <Text as="p">{t("stepper.step5.description")}</Text>
            </Box>
            <Box paddingBlockStart={"500"}>
                {isThemeHasFrakButton || themeWalletButton ? (
                    <Step5Activated
                        type={isThemeHasFrakButton ? "share" : "wallet"}
                    />
                ) : (
                    <Step5NotActivated />
                )}
            </Box>
        </Box>
    );
}

export function Step5Activated({ type }: { type: "share" | "wallet" }) {
    const { t } = useTranslation();

    return (
        <Text as="p" variant="bodyMd">
            <Badge tone="success" icon={CheckIcon}>
                {type === "share"
                    ? t("stepper.step5.activated")
                    : t("stepper.step5.walletButtonConnected")}
            </Badge>
        </Text>
    );
}

export function Step5NotActivated({
    type,
    defaultOpen,
}: { type?: "share" | "wallet"; defaultOpen?: boolean }) {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const data = useLoaderData<typeof loader>();
    const firstProduct = data?.firstProduct;
    const editorUrl = `https://${rootData?.shop?.myshopifyDomain}/admin/themes/current/editor`;
    const showShare = type === "share" || type === undefined;
    const showWallet = type === "wallet" || type === undefined;

    return (
        <>
            {showShare && (
                <WalletActivated
                    defaultOpen={defaultOpen}
                    editorUrl={editorUrl}
                    firstProduct={firstProduct}
                />
            )}
            {showWallet && (
                <Box paddingBlockStart={"500"}>
                    <WalletNotActivated
                        defaultOpen={defaultOpen}
                        editorUrl={editorUrl}
                    />
                </Box>
            )}
        </>
    );
}

function WalletActivated({
    defaultOpen,
    editorUrl,
    firstProduct,
}: {
    defaultOpen?: boolean;
    editorUrl: string;
    firstProduct?: FirstProductPublishedReturnType;
}) {
    const { t } = useTranslation();

    return (
        <>
            <Text as="p" variant="bodyMd">
                <Badge tone="critical" icon={XSmallIcon}>
                    {t("stepper.step5.notActivated")}
                </Badge>
            </Text>
            <Box paddingBlockStart={"200"}>
                <Collapsible
                    id="collapsibleButtonShare"
                    title={t("stepper.step5.collapsibleButtonShareTitle")}
                    defaultOpen={defaultOpen}
                >
                    <Box paddingBlockStart={"200"}>
                        <Text as="p" variant="bodyMd">
                            {t("stepper.step5.todo")}
                        </Text>
                        <img src={screenShareButton} alt="" />
                    </Box>
                    <Box paddingBlockStart={"200"}>
                        <Text as="p" variant="bodyMd">
                            {firstProduct ? (
                                <Link
                                    url={`${editorUrl}?previewPath=/products/${firstProduct.handle}`}
                                    target="_blank"
                                >
                                    {t("stepper.step5.link")}
                                </Link>
                            ) : (
                                <>{t("stepper.step5.noProduct")}</>
                            )}
                        </Text>
                    </Box>
                </Collapsible>
            </Box>
        </>
    );
}

export function WalletNotActivated({
    defaultOpen,
    editorUrl,
}: { defaultOpen?: boolean; editorUrl: string }) {
    const { t } = useTranslation();

    return (
        <>
            <Text as="p" variant="bodyMd">
                <Badge tone="critical" icon={XSmallIcon}>
                    {t("stepper.step5.noWalletButtonActivated")}
                </Badge>
            </Text>
            <Box paddingBlockStart={"200"}>
                <Collapsible
                    id="collapsibleButtonWallet"
                    title={t("stepper.step5.collapsibleButtonWalletTitle")}
                    defaultOpen={defaultOpen}
                >
                    <Box paddingBlockStart={"200"}>
                        <Text as="p" variant="bodyMd">
                            {t("stepper.step5.todoWalletButton")}
                        </Text>
                        <img src={screenWalletButton} alt="" />
                    </Box>
                    <Box paddingBlockStart={"200"}>
                        <Text as="p" variant="bodyMd">
                            <Link
                                url={`${editorUrl}?context=apps`}
                                target="_blank"
                            >
                                {t("walletButton.link")}
                            </Link>
                        </Text>
                    </Box>
                </Collapsible>
            </Box>
        </>
    );
}
