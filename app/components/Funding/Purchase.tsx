import {
    Badge,
    BlockStack,
    Button,
    Card,
    DataTable,
    InlineStack,
    Link,
    Text,
    TextField,
} from "@shopify/polaris";
import type { Tone } from "@shopify/polaris/build/ts/src/components/Badge";
import { useMutation } from "@tanstack/react-query";
import type { loader as rootLoader } from "app/routes/app";
import type { BankStatus } from "app/services.server/backendMerchant";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router";
import type { PurchaseTable } from "../../../db/schema/purchaseTable";

export function PurchaseStatus({
    bankStatus,
    currentPurchases,
}: {
    bankStatus: BankStatus;
    currentPurchases: PurchaseTable["$inferSelect"][];
}) {
    const { t } = useTranslation();

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                    {t("status.purchase.title")}
                </Text>

                <Text variant="bodyMd" as="p">
                    {t("status.purchase.description")}
                </Text>

                {bankStatus.deployed && bankStatus.bankAddress && (
                    <CreatePurchase bankAddress={bankStatus.bankAddress} />
                )}

                <ActivePurchases currentPurchases={currentPurchases} />
            </BlockStack>
        </Card>
    );
}

function ActivePurchases({
    currentPurchases,
}: {
    currentPurchases: PurchaseTable["$inferSelect"][];
}) {
    const { t } = useTranslation();
    const items = useMemo(
        () =>
            currentPurchases.map((purchase) => {
                const { status, variant } = mapStatus(purchase, t);

                return [
                    `$${purchase.amount}`,
                    <Badge key={purchase.id} tone={variant}>
                        {status}
                    </Badge>,
                    purchase.txHash ?? "N/A",
                    purchase.createdAt
                        ? new Date(purchase.createdAt).toLocaleString()
                        : "N/A",
                    <InlineStack key={purchase.id}>
                        {purchase.status === "pending" && (
                            <Link
                                url={purchase.confirmationUrl}
                                key={purchase.id}
                                target="_blank"
                            >
                                {t("status.purchase.confirm")}
                            </Link>
                        )}
                    </InlineStack>,
                ];
            }),
        [currentPurchases, t]
    );

    if (currentPurchases.length === 0) {
        return null;
    }

    return (
        <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
                {t("status.purchase.activePurchases")}
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
                    t("status.purchase.amount"),
                    t("status.purchase.status"),
                    t("status.purchase.txHash"),
                    t("status.purchase.createdAt"),
                    t("status.purchase.actions"),
                ]}
                rows={items}
            />
        </BlockStack>
    );
}

/**
 * Component to fund the merchant bank via Shopify app purchase.
 * Uses the single bank address from the backend BankStatus.
 */
function CreatePurchase({ bankAddress }: { bankAddress: string }) {
    const [amount, setAmount] = useState("");
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const {
        data: confirmationUrl,
        mutate: handleSubmit,
        isPending: isLoading,
    } = useMutation({
        mutationKey: ["createPurchase", amount, bankAddress],
        mutationFn: async () => {
            setError(null);
            const amountNumber = Number(amount);
            if (!amount || Number.isNaN(amountNumber) || amountNumber <= 0) {
                setError(t("status.purchase.errorInvalidAmount"));
                return;
            }
            try {
                const url = `/api/purchase?amount=${amount}&bank=${bankAddress}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Failed to start billing process.");
                }
                return await response.json();
            } catch (e) {
                console.warn("Unable to start billing process", e);
                setError(t("status.purchase.errorBilling"));
            }
        },
    });

    return (
        <BlockStack gap="200">
            <InlineStack gap="200" align="space-evenly">
                <Text variant="bodySm" as="p">
                    {t("status.purchase.selectBank")}: {bankAddress}
                </Text>
                <TextField
                    label={t("status.purchase.amountToFund")}
                    type="number"
                    value={amount}
                    onChange={setAmount}
                    autoComplete="off"
                    min={0}
                    step={0.5}
                    disabled={isLoading || confirmationUrl}
                    suffix={rootData?.shop.preferredCurrency ?? "USD"}
                />
                <Button
                    onClick={handleSubmit}
                    loading={isLoading}
                    disabled={!amount || isLoading || confirmationUrl}
                    variant="primary"
                >
                    {t("status.purchase.fundBank")}
                </Button>
            </InlineStack>

            {error && (
                <Text as="span" tone="critical">
                    {error}
                </Text>
            )}

            {confirmationUrl && (
                <Link url={confirmationUrl} target="_blank">
                    <Button variant="primary">
                        {t("status.purchase.confirmPurchase")}
                    </Button>
                </Link>
            )}
        </BlockStack>
    );
}

function mapStatus(
    purchase: PurchaseTable["$inferSelect"],
    t: (key: string) => string
): {
    status: string;
    variant: Tone;
} {
    if (purchase.txStatus === "confirmed") {
        return {
            status: t("status.purchase.done"),
            variant: "success",
        };
    }
    if (purchase.txStatus === "pending" || purchase.status === "active") {
        return {
            status: t("status.purchase.pendingProcessing"),
            variant: "new",
        };
    }

    if (purchase.status === "declined") {
        return {
            status: t("status.purchase.declined"),
            variant: "warning",
        };
    }
    if (purchase.status === "expired") {
        return {
            status: t("status.purchase.expired"),
            variant: "warning",
        };
    }

    if (purchase.status === "pending") {
        return {
            status: t("status.purchase.waitingConfirmation"),
            variant: "info",
        };
    }

    return {
        status: t("status.purchase.pending"),
        variant: "info",
    };
}
