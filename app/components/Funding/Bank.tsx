import { formatAmount } from "@frak-labs/core-sdk";
import { useRouteLoaderData } from "@remix-run/react";
import {
    BlockStack,
    Card,
    DataTable,
    InlineStack,
    SkeletonDisplayText,
    Text,
} from "@shopify/polaris";
import type { loader as rootLoader } from "app/routes/app";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatUnits } from "viem";
import { useConversionRate } from "../../hooks/useConversionRate";
import type { GetProductInfoResponseDto } from "../../hooks/useOnChainShopInfo";
import { useTokenInfoWithBalance } from "../../hooks/usetokenInfo";

export function BankingStatus({
    shopInfo,
}: {
    shopInfo: GetProductInfoResponseDto;
}) {
    const { banks } = shopInfo;
    const { t } = useTranslation();

    return (
        <Card>
            <BlockStack gap="400" align="center" inlineAlign="stretch">
                <Text as="h2" variant="headingMd">
                    {t("status.bank.title")}
                </Text>

                <Text variant="bodyMd" as="p">
                    {t("status.bank.description")}
                </Text>

                <InlineStack gap="400">
                    {banks.map((bank) => (
                        <BankItem key={bank.id} bank={bank} />
                    ))}
                </InlineStack>
            </BlockStack>
        </Card>
    );
}

/**
 * Display each bank items
 * todo: We are creating one table per banks, so the UI will be terrible once we got multiple banks
 */
function BankItem({
    bank,
}: {
    bank: GetProductInfoResponseDto["banks"][number];
}) {
    const { data: tokenInfo, isLoading: tokenInfoLoading } =
        useTokenInfoWithBalance({
            token: bank.tokenId,
            wallet: bank.id,
        });
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const { rate } = useConversionRate({ token: bank.tokenId });

    const { balance, distributed, claimed } = useMemo(() => {
        if (!tokenInfo || !rate) {
            return {
                balance: undefined,
                distributed: undefined,
                claimed: undefined,
            };
        }

        const currency = rootData?.shop.preferredCurrency ?? "usd";

        function formatEthers(value: bigint, decimals: number) {
            const floatValue = Number.parseFloat(formatUnits(value, decimals));
            const currencyRate = rate?.[currency] ?? 1;

            return formatAmount(floatValue * currencyRate, currency);
        }

        return {
            balance: formatEthers(
                tokenInfo.balance ?? 0n,
                tokenInfo.decimals ?? 18
            ),
            distributed: formatEthers(
                BigInt(bank.totalDistributed),
                tokenInfo.decimals ?? 18
            ),
            claimed: formatEthers(
                BigInt(bank.totalClaimed),
                tokenInfo.decimals ?? 18
            ),
        };
    }, [tokenInfo, bank, rate, rootData?.shop.preferredCurrency]);
    const { t } = useTranslation();

    if (tokenInfoLoading || !tokenInfo) {
        return <SkeletonDisplayText size="small" />;
    }

    return (
        <DataTable
            columnContentTypes={["text", "text", "text", "text", "text"]}
            headings={[
                t("status.bank.token"),
                t("status.bank.balance"),
                t("status.bank.distributed"),
                t("status.bank.claimed"),
                t("status.bank.address"),
            ]}
            rows={[
                [
                    `${tokenInfo.name} (${tokenInfo.symbol})`,
                    balance,
                    distributed,
                    claimed,
                    bank.id,
                ],
            ]}
        />
    );
}
