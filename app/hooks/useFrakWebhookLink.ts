import { useMemo } from "react";

export function useFrakWebhookLink({ productId }: { productId: string }) {
    return useMemo(() => {
        // Build the url
        const createUrl = new URL(
            process.env.BUSINESS_URL ?? "https://business.frak.id"
        );
        createUrl.pathname = "/embedded/purchase-tracker";
        createUrl.searchParams.append("pid", productId);
        return createUrl.toString();
    }, [productId]);
}
