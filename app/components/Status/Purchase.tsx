import {
    Badge,
    BlockStack,
    Button,
    Card,
    DataTable,
    InlineStack,
    Link,
    Select,
    Text,
    TextField,
} from "@shopify/polaris";
import type { Tone } from "@shopify/polaris/build/ts/src/components/Badge";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { PurchaseTable } from "../../../db/schema/purchaseTable";
import type { GetProductInfoResponseDto } from "../../hooks/useOnChainShopInfo";

export function PurchaseStatus({
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
                    Purchase
                </Text>

                <Text variant="bodyMd" as="p">
                    By making a Purchase you will add funds to the bank. The
                    fund will be be used to distribute rewards to end users.
                </Text>

                <CreatePurchase banks={banks} />

                <ActivePurchases currentPurchases={currentPurchases} />
            </BlockStack>
        </Card>
    );
}

function ActivePurchases({
    currentPurchases,
}: { currentPurchases: PurchaseTable["$inferSelect"][] }) {
    const items = useMemo(
        () =>
            currentPurchases.map((purchase) => {
                const { status, variant } = mapStatus(purchase);

                return [
                    `$${purchase.amount}`,
                    <Badge key={purchase.id} tone={variant}>
                        {status}
                    </Badge>,
                    purchase.txHash ?? "N/A",
                    purchase.createdAt?.toISOString(),
                    <InlineStack key={purchase.id}>
                        {purchase.status === "pending" && (
                            <Link
                                url={purchase.confirmationUrl}
                                key={purchase.id}
                                target="_blank"
                            >
                                Confirm
                            </Link>
                        )}
                    </InlineStack>,
                ];
            }),
        [currentPurchases]
    );

    if (currentPurchases.length === 0) {
        return null;
    }

    return (
        <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
                Active Purchases
            </Text>
            <DataTable
                columnContentTypes={[
                    "numeric",
                    "text",
                    "text",
                    "text",
                    "numeric",
                ]}
                headings={[
                    "Amount",
                    "Status",
                    "Tx Hash",
                    "Created At",
                    "Actions",
                ]}
                rows={items}
            />
        </BlockStack>
    );
}

/**
 * Component that will permit to fund a given bank
 *  under the hood it should trigger the complete stuff to fund the bank via shopify
 *
 * todo: returnUrl page
 */
function CreatePurchase({
    banks,
}: { banks: GetProductInfoResponseDto["banks"] }) {
    const [amount, setAmount] = useState("");
    const [selectedBank, setSelectedBank] = useState(
        banks.length === 1 ? banks[0].id : ""
    );
    const [error, setError] = useState<string | null>(null);

    const {
        data: confirmationUrl,
        mutate: handleSubmit,
        isPending: isLoading,
    } = useMutation({
        mutationKey: ["createPurchase", amount, selectedBank],
        mutationFn: async () => {
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
            try {
                const url = `/api/purchase?amount=${amount}&bank=${selectedBank}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Failed to start billing process.");
                }
                return await response.json();
            } catch (e) {
                console.warn("Unable to start billing process", e);
                setError("Failed to start billing process.");
            }
        },
    });

    if (!banks || banks.length === 0) {
        return null;
    }

    return (
        <BlockStack gap="200">
            <InlineStack gap="200" align="space-evenly">
                <Select
                    label="Select bank to fund"
                    options={banks.map((bank) => ({
                        label: bank.id,
                        value: bank.id,
                    }))}
                    value={selectedBank}
                    onChange={(value) => setSelectedBank(value)}
                    disabled={
                        banks.length === 1 || isLoading || confirmationUrl
                    }
                />
                <TextField
                    label="Amount to fund (USD)"
                    type="number"
                    value={amount}
                    onChange={setAmount}
                    autoComplete="off"
                    min={0}
                    step={0.5}
                    disabled={isLoading || confirmationUrl}
                />
                <Button
                    onClick={handleSubmit}
                    loading={isLoading}
                    disabled={
                        !amount || !selectedBank || isLoading || confirmationUrl
                    }
                    variant="primary"
                >
                    Fund bank
                </Button>
            </InlineStack>

            {error && (
                <Text as="span" tone="critical">
                    {error}
                </Text>
            )}

            {confirmationUrl && (
                <Link url={confirmationUrl} target="_blank">
                    <Button variant="primary">Confirm the purchase</Button>
                </Link>
            )}
        </BlockStack>
    );
}

function mapStatus(purchase: PurchaseTable["$inferSelect"]): {
    status: string;
    variant: Tone;
} {
    if (purchase.txStatus === "confirmed") {
        return {
            status: "Done",
            variant: "success",
        };
    }
    if (purchase.txStatus === "pending" || purchase.status === "active") {
        return {
            status: "Pending processing",
            variant: "new",
        };
    }

    if (purchase.status === "declined") {
        return {
            status: "Declined",
            variant: "warning",
        };
    }
    if (purchase.status === "expired") {
        return {
            status: "Expired",
            variant: "warning",
        };
    }

    if (purchase.status === "pending") {
        return {
            status: "Waiting your confirmation",
            variant: "info",
        };
    }

    return {
        status: "Pending",
        variant: "info",
    };
}
