import { type Currency, formatAmount } from "@frak-labs/core-sdk";
import {
    Badge,
    BlockStack,
    Button,
    Card,
    Collapsible,
    DataTable,
    InlineGrid,
    InlineStack,
    RangeSlider,
    Text,
    TextField,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import type { loader as rootLoader } from "app/routes/app";
import type {
    BankStatus,
    CampaignResponse,
} from "app/services.server/backendMerchant";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router";
import type { Address } from "viem";
import { useCreateCampaignLink } from "../../hooks/useCreateCampaignLink";
import { useRefreshData } from "../../hooks/useRefreshData";

export function CampaignStatus({
    campaigns,
    bankStatus,
}: {
    campaigns: CampaignResponse[];
    bankStatus: BankStatus;
}) {
    const { t } = useTranslation();
    const [creationOpen, setCreationOpen] = useState(false);

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                    {t("status.campaign.title")}
                </Text>

                <Text variant="bodyMd" as="p">
                    {t("status.campaign.description")}
                </Text>

                <CampaignTable campaigns={campaigns} />

                <Button
                    icon={creationOpen ? ChevronUpIcon : ChevronDownIcon}
                    onClick={() => setCreationOpen(!creationOpen)}
                >
                    {t("status.campaign.createOpen")}
                </Button>

                <Collapsible
                    open={creationOpen}
                    id="campaign-creation"
                    transition={{
                        duration: "500ms",
                        timingFunction: "ease-in-out",
                    }}
                >
                    <CampaignCreation bankAddress={bankStatus.bankAddress} />
                </Collapsible>
            </BlockStack>
        </Card>
    );
}

function CampaignTable({ campaigns }: { campaigns: CampaignResponse[] }) {
    const { t } = useTranslation();
    return (
        <DataTable
            columnContentTypes={["text", "text", "text"]}
            headings={[
                t("status.campaign.name"),
                t("status.campaign.type"),
                t("status.campaign.active"),
            ]}
            rows={campaigns
                .filter((c) => c.status === "active")
                .map((campaign) => [
                    campaign.name,
                    campaign.rule.trigger,
                    <CampaignStatusBadge
                        key={campaign.id}
                        status={campaign.status}
                    />,
                ])}
        />
    );
}

function CampaignStatusBadge({
    status,
}: {
    status: CampaignResponse["status"];
}) {
    const { t } = useTranslation();

    const tone = status === "active" ? "success" : "warning";

    return (
        <InlineStack gap="200">
            <Badge tone={tone}>{t("status.campaign.active")}</Badge>
        </InlineStack>
    );
}

function CampaignCreation({ bankAddress }: { bankAddress: Address | null }) {
    const { t } = useTranslation();
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");

    const [globalBudget, setGlobalBudget] = useState("");
    const [rawCAC, setRawCAC] = useState("");
    const [ratio, setRatio] = useState(90); // 90% referrer, 10% referee
    const [name, setName] = useState("");

    const isCreationDisabled = useMemo(() => {
        if (!bankAddress) return true;
        if (!globalBudget || !rawCAC) return true;

        return false;
    }, [globalBudget, rawCAC, bankAddress]);

    // Breakdown calculations
    const breakdown = useMemo(() => {
        const cac = Number(rawCAC) || 0;

        const commission = cac * 0.2;
        const afterCommission = cac - commission;
        const referrerAmount = afterCommission * (ratio / 100);
        const refereeAmount = afterCommission * (1 - ratio / 100);

        const maxUsers = globalBudget && cac ? Number(globalBudget) / cac : 0;

        return {
            cac,
            commission,
            afterCommission,
            referrerAmount,
            refereeAmount,
            maxUsers,
        };
    }, [rawCAC, ratio, globalBudget]);

    const currencySymbol = (rootData?.shop.preferredCurrency ??
        "usd") as Currency;

    // The creation link
    const creationLink = useCreateCampaignLink({
        bankId: bankAddress ?? "0x",
        globalBudget: Number(globalBudget),
        rawCAC: Number(rawCAC),
        ratio,
        name,
        merchantId: rootData?.merchantId ?? ""
    });
    const refresh = useRefreshData();

    // Open creation link
    const handleCreate = useCallback(() => {
        console.log("creationLink", creationLink);
        const openedWindow = window.open(
            creationLink,
            "frak-business",
            "menubar=no,status=no,scrollbars=no,fullscreen=no,width=500, height=800"
        );

        if (openedWindow) {
            openedWindow.focus();

            // Check every 500ms if the window is closed
            // If it is, revalidate the page
            const timer = setInterval(() => {
                if (openedWindow.closed) {
                    clearInterval(timer);
                    setTimeout(() => refresh(), 1000);
                }
            }, 500);
        }
    }, [creationLink, refresh]);

    if (!bankAddress) {
        return null;
    }

    return (
        <BlockStack gap="400">
            <InlineGrid gap="200" columns={2}>
                <TextField
                    label={t("status.campaign.nameInput")}
                    value={name}
                    onChange={setName}
                    autoComplete="off"
                />
                <Text variant="bodySm" as="p">
                    {t("status.campaign.bankSelect")}: {bankAddress}
                </Text>
            </InlineGrid>
            <InlineGrid gap="200" columns={2}>
                <BlockStack gap="200">
                    <TextField
                        label={t("status.campaign.budget")}
                        type="number"
                        value={globalBudget}
                        onChange={setGlobalBudget}
                        autoComplete="off"
                        min={0}
                        step={0.01}
                        suffix={currencySymbol}
                    />
                    <Text variant="bodySm" as="p">
                        {t("status.campaign.budgetInfo")}
                    </Text>
                </BlockStack>
                <BlockStack gap="200">
                    <TextField
                        label={t("status.campaign.rawCAC")}
                        type="number"
                        value={rawCAC}
                        onChange={setRawCAC}
                        autoComplete="off"
                        min={0}
                        step={0.01}
                        suffix={currencySymbol}
                    />
                    <Text variant="bodySm" as="p">
                        {t("status.campaign.rawCACInfo")}
                    </Text>
                </BlockStack>
            </InlineGrid>
            <InlineStack gap="400" blockAlign="center" align="space-around">
                <Text variant="bodyMd" as="span">
                    {t("status.campaign.ratioReferrer")}
                </Text>
                <RangeSlider
                    label={t("status.campaign.ratio")}
                    value={ratio}
                    min={10}
                    max={90}
                    step={5}
                    onChange={(value) => setRatio(value as number)}
                    output
                    helpText={t("status.campaign.ratioHelp")}
                />
                <Text variant="bodyMd" as="span">
                    {t("status.campaign.ratioReferee")}
                </Text>
            </InlineStack>
            <BlockStack gap="100">
                <Text variant="bodyMd" as="span">
                    {`${t("status.campaign.breakdown.rawCAC")}: ${formatAmount(breakdown.cac, currencySymbol)}`}
                </Text>
                <Text variant="bodyMd" as="span">
                    {`${t("status.campaign.breakdown.commission")}: ${formatAmount(breakdown.commission, currencySymbol)} (20%)`}
                </Text>
                <Text variant="bodyMd" as="span">
                    {`${t("status.campaign.breakdown.referrer")}: ${formatAmount(breakdown.referrerAmount, currencySymbol)} (${ratio}%)`}
                </Text>
                <Text variant="bodyMd" as="span">
                    {`${t("status.campaign.breakdown.referee")}: ${formatAmount(breakdown.refereeAmount, currencySymbol)} (${100 - ratio}%)`}
                </Text>
                <Text variant="bodyMd" as="span">
                    {`${t("status.campaign.breakdown.newUser")}: ${breakdown.maxUsers.toFixed(0)}`}
                </Text>
            </BlockStack>
            <Button
                variant="primary"
                onClick={handleCreate}
                disabled={isCreationDisabled}
            >
                {t("status.campaign.createButton")}
            </Button>
        </BlockStack>
    );
}
