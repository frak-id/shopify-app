import { useFetcher } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Button } from "@shopify/polaris";
import type {
    CreateWebPixelReturnType,
    DeleteWebPixelReturnType,
} from "app/services.server/webPixel";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export type IntentWebPixel = "createWebPixel" | "deleteWebPixel";

export function Pixel({ id }: { id?: string }) {
    const shopify = useAppBridge();
    const fetcher = useFetcher<
        CreateWebPixelReturnType | DeleteWebPixelReturnType
    >();
    const { t } = useTranslation();

    useEffect(() => {
        if (!fetcher.data) return;

        const data = fetcher.data;
        const { userErrors } = data;
        const webPixel = (data as CreateWebPixelReturnType).webPixel;
        const deletedWebPixelId = (data as DeleteWebPixelReturnType)
            .deletedWebPixelId;

        if (userErrors?.length > 0) {
            shopify.toast.show(t("pixel.actions.messages.error"), {
                isError: true,
            });
        }

        if (webPixel) {
            shopify.toast.show(t("pixel.actions.messages.connect"));
        }

        if (deletedWebPixelId) {
            shopify.toast.show(t("pixel.actions.messages.disconnect"));
        }
    }, [fetcher.data, shopify.toast, t]);

    const handleAction = async (intent: IntentWebPixel) => {
        fetcher.submit({ intent }, { method: "POST", action: "/app/pixel" });
    };

    return (
        <>
            {!id && (
                <Button
                    variant="primary"
                    loading={fetcher.state !== "idle"}
                    disabled={fetcher.state !== "idle"}
                    onClick={() => handleAction("createWebPixel")}
                >
                    {t("pixel.actions.cta.connect")}
                </Button>
            )}
            {id && (
                <Button
                    variant="primary"
                    loading={fetcher.state !== "idle"}
                    disabled={fetcher.state !== "idle"}
                    onClick={() => handleAction("deleteWebPixel")}
                >
                    {t("pixel.actions.cta.disconnect")}
                </Button>
            )}
        </>
    );
}
