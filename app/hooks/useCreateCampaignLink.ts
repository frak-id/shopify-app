import type { loader as rootLoader } from "app/routes/app";
import { useMemo } from "react";
import { useRouteLoaderData } from "react-router";
import type { Address } from "viem";

export function useCreateCampaignLink({
    globalBudget,
    bankId,
    rawCAC,
    ratio,
    name,
}: {
    bankId: Address;
    globalBudget: number;
    rawCAC: number;
    ratio: number;
    name: string;
}) {
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");

    return useMemo(() => {
        // Build the url
        const createUrl = new URL(
            process.env.BUSINESS_URL ?? "https://business.frak.id"
        );
        createUrl.pathname = "/embedded/create-campaign";

        createUrl.searchParams.append("n", name);
        createUrl.searchParams.append("bid", bankId);
        createUrl.searchParams.append("d", rootData?.shop?.domain ?? "");
        createUrl.searchParams.append("gb", globalBudget.toString());
        createUrl.searchParams.append("cac", rawCAC.toString());
        createUrl.searchParams.append("r", ratio.toString());
        if (rootData?.shop?.preferredCurrency) {
            createUrl.searchParams.append(
                "sc",
                rootData.shop.preferredCurrency
            );
        }

        return createUrl.toString();
    }, [
        rawCAC,
        ratio,
        globalBudget,
        name,
        rootData?.shop?.domain,
        rootData?.shop?.preferredCurrency,
        bankId,
    ]);
}
