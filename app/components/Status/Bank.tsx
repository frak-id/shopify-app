import {
    BlockStack,
    Card,
    DataTable,
    InlineStack,
    SkeletonDisplayText,
    Text,
} from "@shopify/polaris";
import { useMemo } from "react";
import { formatUnits } from "viem";
import type { GetProductInfoResponseDto } from "../../hooks/useOnChainShopInfo";
import { useTokenInfoWithBalance } from "../../hooks/usetokenInfo";

export function BankingStatus({
    shopInfo,
}: {
    shopInfo: GetProductInfoResponseDto;
}) {
    const { banks } = shopInfo;

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                    Banks
                </Text>

                <Text variant="bodyMd" as="p">
                    The banks are the source of cash that will be used to
                    distribute rewards to end users.
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
            balance: formatUnits(tokenInfo.balance, tokenInfo.decimals),
            distributed: formatUnits(
                BigInt(bank.totalDistributed),
                tokenInfo.decimals
            ),
            claimed: formatUnits(BigInt(bank.totalClaimed), tokenInfo.decimals),
        };
    }, [tokenInfo, bank]);

    if (tokenInfoLoading || !tokenInfo) {
        return <SkeletonDisplayText size="small" />;
    }

    return (
        <DataTable
            columnContentTypes={["text", "text", "text", "text", "text"]}
            headings={["Token", "Balance", "Distributed", "Claimed", "Address"]}
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
