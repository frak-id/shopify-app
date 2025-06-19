import {
    BlockStack,
    Card,
    DataTable,
    InlineStack,
    SkeletonDisplayText,
    Text,
} from "@shopify/polaris";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatUnits } from "viem";
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
 * todo: We are creating one table per banks, so the UI will be terrible once we got multiple banks, but since only one for now balek
 */
function BankItem({
    bank,
}: { bank: GetProductInfoResponseDto["banks"][number] }) {
    const { data: tokenInfo, isLoading: tokenInfoLoading } =
        useTokenInfoWithBalance({
            token: bank.tokenId,
            wallet: bank.id,
        });
    const { balance, distributed, claimed } = useMemo(() => {
        if (!tokenInfo) {
            return {
                balance: undefined,
                distributed: undefined,
                claimed: undefined,
            };
        }

        return {
            balance: formatUnits(
                tokenInfo.balance ?? 0n,
                tokenInfo.decimals ?? 18
            ),
            distributed: formatUnits(
                BigInt(bank.totalDistributed),
                tokenInfo.decimals ?? 18
            ),
            claimed: formatUnits(
                BigInt(bank.totalClaimed),
                tokenInfo.decimals ?? 18
            ),
        };
    }, [tokenInfo, bank]);
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
                    `${balance} ${tokenInfo.symbol}`,
                    `${distributed} ${tokenInfo.symbol}`,
                    `${claimed} ${tokenInfo.symbol}`,
                    bank.id,
                ],
            ]}
        />
    );
}
