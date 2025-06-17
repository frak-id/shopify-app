import { useWalletStatus } from "@frak-labs/react-sdk";
import {
    useFetcher,
    useRevalidator,
    useRouteLoaderData,
} from "@remix-run/react";
import { Button, Text } from "@shopify/polaris";
import { useMutation } from "@tanstack/react-query";
import type { loader as rootLoader } from "app/routes/app";
import type { OnboardingStepData } from "app/utils/onboarding";
import { useTranslation } from "react-i18next";
import { StepItem } from ".";

export function Step1({
    onboardingData,
}: {
    onboardingData: OnboardingStepData;
}) {
    const { shopInfo } = onboardingData;
    const { t } = useTranslation();
    const { revalidate } = useRevalidator();
    const { data: walletStatus } = useWalletStatus();
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const fetcher = useFetcher();

    const { mutate: openMintEmbed, isPending } = useMutation({
        mutationKey: ["setup", "mint-embed"],
        mutationFn: async () => {
            if (!walletStatus?.wallet) return null;

            const url = `/api/mint?walletAddress=${encodeURIComponent(walletStatus.wallet)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw {
                    error: `HTTP error ${response.status}`,
                    details: await response.text(),
                };
            }

            const setupCode: string = await response.json();

            // Build the url
            const mintUrl = new URL(
                process.env.BUSINESS_URL ?? "https://business.frak.id"
            );
            mintUrl.pathname = "/embedded/mint";
            mintUrl.searchParams.append("sc", setupCode);
            mintUrl.searchParams.append("d", rootData?.shop?.domain ?? "");
            mintUrl.searchParams.append("n", rootData?.shop?.name ?? "");
            mintUrl.searchParams.append("pt", "webshop,referral,purchase");

            const link = mintUrl.toString();

            const openedWindow = window.open(
                link,
                "frak-business",
                "menubar=no,status=no,scrollbars=no,fullscreen=no,width=500, height=800"
            );

            if (openedWindow) {
                openedWindow.focus();

                // Check every 500ms if the window is closed
                // If it is, clear cache and revalidate the page
                const timer = setInterval(() => {
                    if (openedWindow.closed) {
                        clearInterval(timer);

                        // Clear the on-chain shop cache before revalidating
                        fetcher.submit(
                            { intent: "clearCache" },
                            { method: "POST", action: "/app/onboarding" }
                        );

                        setTimeout(() => revalidate(), 1000);
                    }
                }, 500);
            }
        },
    });

    // Check if the shop is connected
    const isConnected = !!shopInfo;

    return (
        <StepItem checked={isConnected}>
            <Text variant="bodyMd" as="p">
                {t("status.connectionStatus.title")}
            </Text>
            {!isConnected && (
                <Button
                    onClick={openMintEmbed}
                    variant="primary"
                    loading={isPending}
                    disabled={walletStatus?.wallet === undefined}
                >
                    {t("status.modal.button")}
                </Button>
            )}
        </StepItem>
    );
}
