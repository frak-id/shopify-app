import { useRouteLoaderData } from "@remix-run/react";
import type { loader as rootLoader } from "app/routes/app";
import { useMemo } from "react";
import type { Address } from "viem";

export function useCreateCampaignLink({
    weeklyBudget,
    bankId,
    rawCAC,
    ratio,
    name,
}: {
    bankId: Address;
    weeklyBudget: number;
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
        createUrl.searchParams.append("wb", weeklyBudget.toString());
        createUrl.searchParams.append("cac", rawCAC.toString());
        createUrl.searchParams.append("r", ratio.toString());

        return createUrl.toString();
    }, [rawCAC, ratio, weeklyBudget, name, rootData?.shop?.domain, bankId]);
}
