import {
    BlockStack,
    Button,
    Card,
    InlineStack,
    Select,
    SkeletonDisplayText,
    Text,
    TextField,
} from "@shopify/polaris";
import { useMemo, useState } from "react";
import { formatUnits } from "viem";
import type { PurchaseTable } from "../../../db/schema/purchaseTable";
import type { GetProductInfoResponseDto } from "../../hooks/useOnChainShopInfo";
import { useTokenInfoWithBalance } from "../../hooks/usetokenInfo";

export function BankingStatus({
    shopInfo,
    currentPurchases,
}: {
    shopInfo: GetProductInfoResponseDto;
    currentPurchases: PurchaseTable["$inferSelect"][];
}) {
    const { banks } = shopInfo;

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                    Funding
                </Text>

                <FundBanks banks={banks} />

                <ActivePurchases currentPurchases={currentPurchases} />

                <Text as="h2" variant="headingMd">
                    Banks
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

function ActivePurchases({
    currentPurchases,
}: { currentPurchases: PurchaseTable["$inferSelect"][] }) {
    return (
        <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
                Active Purchases
            </Text>
            {currentPurchases.map((purchase) => (
                <PurchaseItem key={purchase.id} purchase={purchase} />
            ))}
        </BlockStack>
    );
}

function PurchaseItem({
    purchase,
}: { purchase: PurchaseTable["$inferSelect"] }) {
    return (
        <BlockStack gap="200">
            <Text as="span" variant="bodyMd">
                {purchase.id}
            </Text>
            <Text as="span" variant="bodyMd">
                {purchase.amount}
            </Text>
            <Text as="span" variant="bodyMd">
                {purchase.status}
            </Text>
        </BlockStack>
    );
}

/**
 * Component that will permit to fund a given bank
 *  under the hood it should trigger the complete stuff to fund the bank via shopify
 */
function FundBanks({ banks }: { banks: GetProductInfoResponseDto["banks"] }) {
    const [amount, setAmount] = useState("");
    const [selectedBank, setSelectedBank] = useState(
        banks.length === 1 ? banks[0].id : ""
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!banks || banks.length === 0) {
        return null;
    }

    const handleSubmit = async () => {
        setError(null);
        const amountNumber = Number(amount);
        if (!amount || Number.isNaN(amountNumber) || amountNumber <= 0) {
            setError("Please enter a valid amount.");
            return;
        }
        if (!selectedBank) {
            setError("Please select a bank.");
            return;
        }
        setLoading(true);
        try {
            // TODO: Implement Shopify one-time purchase billing flow here
            // Example: await triggerShopifyBilling(amountNumber, selectedBank);
            alert(`Trigger billing: $${amountNumber} to bank ${selectedBank}`);
        } catch (e) {
            console.warn("Unable to start billing process", e);
            setError("Failed to start billing process.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <BlockStack gap="200">
            <TextField
                label="Amount to fund (USD)"
                type="number"
                value={amount}
                onChange={setAmount}
                autoComplete="off"
                min={0}
                step={0.5}
            />
            {banks.length > 1 && (
                <Select
                    label="Select bank to fund"
                    options={banks.map((bank) => ({
                        label: bank.id,
                        value: bank.id,
                    }))}
                    value={selectedBank}
                    onChange={(value) => setSelectedBank(value)}
                />
            )}
            {error && (
                <Text as="span" tone="critical">
                    {error}
                </Text>
            )}
            <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!amount || !selectedBank || loading}
                variant="primary"
            >
                Fund bank
            </Button>
        </BlockStack>
    );
}

/**
 * Display each bank items
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
        <BlockStack gap="100">
            <Text as="span" variant="bodyMd" fontWeight="bold">
                Address:
            </Text>
            <Text as="span" variant="bodyMd">
                {bank.id}
            </Text>
            <Text as="span" variant="bodyMd" fontWeight="bold">
                Token:
            </Text>
            <Text as="span" variant="bodyMd">
                {tokenInfo.name} ({tokenInfo.symbol})
            </Text>
            <InlineStack gap="200">
                <Text as="span" variant="bodyMd">
                    <b>Balance:</b> {balance} {tokenInfo.symbol}
                </Text>
                <Text as="span" variant="bodyMd">
                    <b>Distributed:</b> {distributed} {tokenInfo.symbol}
                </Text>
                <Text as="span" variant="bodyMd">
                    <b>Claimed:</b> {claimed} {tokenInfo.symbol}
                </Text>
            </InlineStack>
        </BlockStack>
    );
}
