import {
    FrakConfigProvider,
    FrakIFrameClientProvider,
} from "@frak-labs/react-sdk";
import type { PropsWithChildren } from "react";

export function FrakProvider({ children }: PropsWithChildren) {
    const frakWalletSdkConfig = {
        walletUrl: process.env.FRAK_WALLET_URL ?? "https://wallet.frak.id",
        metadata: {
            name: "Shopify App",
        },
        domain: "app-shopify.frak.id",
    };

    return (
        <FrakConfigProvider config={frakWalletSdkConfig}>
            <FrakIFrameClientProvider>{children}</FrakIFrameClientProvider>
        </FrakConfigProvider>
    );
}
