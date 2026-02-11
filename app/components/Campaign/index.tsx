import { type Currency, formatAmount } from "@frak-labs/core-sdk";
import { useRouteLoaderData } from "@remix-run/react";
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
    Select,
    SkeletonDisplayText,
    Text,
    TextField,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import type { loader as rootLoader } from "app/routes/app";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateCampaignLink } from "../../hooks/useCreateCampaignLink";
import { useOnChainCampaignInfo } from "../../hooks/useOnChainCampaignInfo";
import type { GetProductInfoResponseDto } from "../../hooks/useOnChainShopInfo";
import { useRefreshData } from "../../hooks/useRefreshData";

export function CampaignStatus({
    shopInfo,
}: {
    shopInfo: GetProductInfoResponseDto;
}) {
    const { campaigns, banks } = shopInfo;
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
                    <CampaignCreation banks={banks} />
                </Collapsible>
            </BlockStack>
        </Card>
    );
}

function CampaignTable({
    campaigns,
}: {
    campaigns: GetProductInfoResponseDto["campaigns"];
}) {
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
                .filter((c) => c?.attached)
                .map((campaign) => [
                    campaign.name,
                    campaign.type,
                    <CampaignStatusBadge
                        key={campaign.id}
                        campaign={campaign}
                    />,
                ])}
        />
    );
}

function CampaignStatusBadge({
    campaign,
}: {
    campaign: GetProductInfoResponseDto["campaigns"][number];
}) {
    const { data: campaignInfo, isLoading: campaignInfoLoading } =
        useOnChainCampaignInfo(campaign.id);
    const { t } = useTranslation();

    if (campaignInfoLoading || !campaignInfo) {
        return <SkeletonDisplayText size="small" />;
    }

    return (
        <InlineStack gap="200">
            <Badge
                tone={
                    campaign.attached && campaignInfo.isActive
                        ? "success"
                        : "warning"
                }
            >
                {t("status.campaign.active")}
            </Badge>
            <Badge
                tone={
                    campaign.attached && campaignInfo.isRunning
                        ? "success"
                        : "warning"
                }
            >
                {t("status.campaign.running")}
            </Badge>
        </InlineStack>
    );
}

function CampaignCreation({
    banks,
}: {
    banks: GetProductInfoResponseDto["banks"];
}) {
    const { t } = useTranslation();
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");

    const [selectedBankId, setSelectedBankId] = useState(
        banks.length === 1 ? banks[0].id : ""
    );
    const selectedBank = banks.find((b) => b.id === selectedBankId) || null;

    const [globalBudget, setGlobalBudget] = useState("");
    const [rawCAC, setRawCAC] = useState("");
    const [ratio, setRatio] = useState(90); // 90% referrer, 10% referee
    const [name, setName] = useState("");

    const isCreationDisabled = useMemo(() => {
        if (!selectedBank) return true;
        if (!globalBudget || !rawCAC) return true;

        return false;
    }, [globalBudget, rawCAC, selectedBank]);

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

    // Bank select options (just show id, show balance separately)
    const bankOptions = banks.map((bank) => ({
        label: bank.id,
        value: bank.id,
    }));

    // The creation link
    const creationLink = useCreateCampaignLink({
        bankId: selectedBank?.id ?? "0x",
        globalBudget: Number(globalBudget),
        rawCAC: Number(rawCAC),
        ratio,
        name,
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

    return (
        <BlockStack gap="400">
            <InlineGrid gap="200" columns={2}>
                <TextField
                    label={t("status.campaign.nameInput")}
                    value={name}
                    onChange={setName}
                    autoComplete="off"
                />
                <Select
                    label={t("status.campaign.bankSelect")}
                    options={bankOptions}
                    value={selectedBankId}
                    onChange={setSelectedBankId}
                    disabled={banks.length === 0 || banks.length === 1}
                />
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
                        disabled={!selectedBank}
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
                        disabled={!selectedBank}
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
                    disabled={!selectedBank}
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
