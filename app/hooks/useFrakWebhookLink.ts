import { useMemo } from "react";
import { buildWebhookLink } from "../utils/url";

export function useFrakWebhookLink({ productId }: { productId: string }) {
    return useMemo(
        () =>
            buildWebhookLink(
                process.env.BUSINESS_URL ?? "https://business.frak.id",
                productId
            ),
        [productId]
    );
}
