import { useAppBridge } from "@shopify/app-bridge-react";
import {
    BlockStack,
    Button,
    Card,
    Collapsible,
    DescriptionList,
    InlineStack,
    RangeSlider,
    Select,
    SkeletonDisplayText,
    Text,
    TextField,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatUnits } from "viem";
import { useOnChainCampaignInfo } from "../../hooks/useOnChainCampaignInfo";
import type { GetProductInfoResponseDto } from "../../hooks/useOnChainShopInfo";
import { useTokenInfoWithBalance } from "../../hooks/usetokenInfo";

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

                <BlockStack gap="200">
                    {campaigns.map((campaign) => (
                        <CampaignItem key={campaign.id} campaign={campaign} />
                    ))}
                </BlockStack>

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

/**
 * Display each bank items
 */
function CampaignItem({
    campaign,
}: { campaign: GetProductInfoResponseDto["campaigns"][number] }) {
    const { data: campaignInfo, isLoading: campaignInfoLoading } =
        useOnChainCampaignInfo(campaign.id);
    const { t } = useTranslation();

    if (campaignInfoLoading || !campaignInfo) {
        return <SkeletonDisplayText size="small" />;
    }

    return (
        <DescriptionList
            items={[
                {
                    term: t("status.campaign.name"),
                    description: campaign.name,
                },
                {
                    term: t("status.campaign.type"),
                    description: campaign.type,
                },
                {
                    term: t("status.campaign.active"),
                    description: campaignInfo.isActive
                        ? t("status.campaign.yes")
                        : t("status.campaign.no"),
                },
                {
                    term: t("status.campaign.running"),
                    description: campaignInfo.isRunning
                        ? t("status.campaign.yes")
                        : t("status.campaign.no"),
                },
            ]}
        />
    );
}

function CampaignCreation({
    banks,
}: { banks: GetProductInfoResponseDto["banks"] }) {
    const { t } = useTranslation();
    const appBridge = useAppBridge();
    const [selectedBankId, setSelectedBankId] = useState(
        banks.length === 1 ? banks[0].id : ""
    );
    const selectedBank = banks.find((b) => b.id === selectedBankId) || null;
    const { data: tokenInfo, isLoading: tokenInfoLoading } =
        useTokenInfoWithBalance({
            token: selectedBank?.tokenId,
            wallet: selectedBank?.id,
        });
    const [weeklyBudget, setWeeklyBudget] = useState("");
    const [rawCAC, setRawCAC] = useState("");
    const [ratio, setRatio] = useState(90); // 90% referrer, 10% referee
    const disabled = !selectedBank || tokenInfoLoading;

    // Breakdown calculations
    const breakdown = useMemo(() => {
        const cac = Number(rawCAC) || 0;

        const commission = cac * 0.2;
        const afterCommission = cac - commission;
        const referrerAmount = afterCommission * (ratio / 100);
        const refereeAmount = afterCommission * (1 - ratio / 100);

        const maxWeeklyUsers =
            weeklyBudget && cac ? Number(weeklyBudget) / cac : 0;

        return {
            cac,
            commission,
            afterCommission,
            referrerAmount,
            refereeAmount,
            maxWeeklyUsers,
        };
    }, [rawCAC, ratio, weeklyBudget]);

    // Bank balance
    const tokenSymbol = tokenInfo?.symbol || "";
    const bankBalance = tokenInfo
        ? `${formatUnits(tokenInfo.balance ?? 0n, tokenInfo.decimals ?? 18)} ${tokenInfo?.symbol}`
        : undefined;

    // Bank select options (just show id, show balance separately)
    const bankOptions = banks.map((bank) => ({
        label: bank.id,
        value: bank.id,
    }));

    // Toast
    const handleCreate = () => {
        appBridge.toast.show(t("status.campaign.toastCreated"), {
            isError: false,
        });
    };

    return (
        <BlockStack gap="400">
            <InlineStack gap="200">
                <Select
                    label={t("status.campaign.bankSelect")}
                    options={bankOptions}
                    value={selectedBankId}
                    onChange={setSelectedBankId}
                    disabled={banks.length === 0 || banks.length === 1}
                />
                {bankBalance && (
                    <Text variant="bodyMd" as="span">
                        {t("status.campaign.bankBalance")}: {bankBalance}
                    </Text>
                )}
            </InlineStack>
            <TextField
                label={t("status.campaign.weeklyBudget")}
                type="number"
                value={weeklyBudget}
                onChange={setWeeklyBudget}
                autoComplete="off"
                min={0}
                step={0.01}
                suffix={tokenSymbol}
                disabled={disabled}
            />
            <BlockStack gap="200">
                <TextField
                    label={t("status.campaign.rawCAC")}
                    type="number"
                    value={rawCAC}
                    onChange={setRawCAC}
                    autoComplete="off"
                    min={0}
                    step={0.01}
                    suffix={tokenSymbol}
                    disabled={disabled}
                />
                <Text variant="bodySm" as="p">
                    {t("status.campaign.rawCACInfo")}
                </Text>
            </BlockStack>
            <InlineStack gap="400" blockAlign="center" align="space-between">
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
                    disabled={disabled}
                />
                <Text variant="bodyMd" as="span">
                    {t("status.campaign.ratioReferee")}
                </Text>
            </InlineStack>
            <BlockStack gap="100">
                <Text variant="bodyMd" as="span">
                    {`${t("status.campaign.breakdown.rawCAC")}: ${breakdown.cac} ${tokenSymbol}`}
                </Text>
                <Text variant="bodyMd" as="span">
                    {`${t("status.campaign.breakdown.commission")}: ${breakdown.commission.toFixed(2)} ${tokenSymbol} (20%)`}
                </Text>
                <Text variant="bodyMd" as="span">
                    {`${t("status.campaign.breakdown.referrer")}: ${breakdown.referrerAmount.toFixed(2)} ${tokenSymbol} (${ratio}%)`}
                </Text>
                <Text variant="bodyMd" as="span">
                    {`${t("status.campaign.breakdown.referee")}: ${breakdown.refereeAmount.toFixed(2)} ${tokenSymbol} (${100 - ratio}%)`}
                </Text>
                <Text variant="bodyMd" as="span">
                    {`${t("status.campaign.breakdown.newUser")}: ${breakdown.maxWeeklyUsers.toFixed(0)}`}
                </Text>
            </BlockStack>
            <Button
                variant="primary"
                onClick={handleCreate}
                disabled={disabled || !weeklyBudget || !rawCAC}
            >
                {t("status.campaign.createButton")}
            </Button>
        </BlockStack>
    );
}
