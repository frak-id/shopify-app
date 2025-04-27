import {
    BlockStack,
    Box,
    Button,
    Icon,
    InlineStack,
    Link,
    List,
    Text,
} from "@shopify/polaris";
import { ExternalIcon } from "@shopify/polaris-icons";
import { useTranslation } from "react-i18next";

type SetupInstructionsProps = {
    setupCode?: string | null;
};

export function SetupInstructions({ setupCode }: SetupInstructionsProps) {
    const { t } = useTranslation();

    return (
        <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
                {t("status.setupInstructions.title")}
            </Text>

            <BlockStack gap="200">
                <Text as="p">{t("status.setupInstructions.description")}</Text>

                <List type="number">
                    <List.Item>
                        {t("status.setupInstructions.step1")}{" "}
                        <Link
                            url="https://business.frak.id"
                            target="_blank"
                            removeUnderline
                        >
                            <InlineStack gap="100" align="center">
                                business.frak.id
                                <Icon source={ExternalIcon} />
                            </InlineStack>
                        </Link>
                    </List.Item>

                    <List.Item>{t("status.setupInstructions.step2")}</List.Item>

                    <List.Item>{t("status.setupInstructions.step3")}</List.Item>

                    <List.Item>
                        {t("status.setupInstructions.step4")}
                        <BlockStack gap="200">
                            <List type="bullet">
                                <List.Item>
                                    <Text as="span" fontWeight="bold">
                                        Product name:
                                    </Text>{" "}
                                    {t("status.setupInstructions.productName")}
                                </List.Item>

                                <List.Item>
                                    <Text as="span" fontWeight="bold">
                                        Product type:
                                    </Text>{" "}
                                    {t("status.setupInstructions.productType")}
                                </List.Item>

                                <List.Item>
                                    <Text as="span" fontWeight="bold">
                                        Setup code:
                                    </Text>{" "}
                                    {t("status.setupInstructions.setupCode")}
                                </List.Item>

                                <List.Item>
                                    <Text as="span" fontWeight="bold">
                                        Domain name:
                                    </Text>{" "}
                                    {t("status.setupInstructions.domainName")}
                                </List.Item>
                            </List>
                        </BlockStack>
                    </List.Item>
                </List>
            </BlockStack>

            <Box paddingBlockStart="400">
                <InlineStack gap="400" align="center">
                    <Button
                        url="https://business.frak.id"
                        target="_blank"
                        variant="primary"
                    >
                        {t("status.setupInstructions.goToFrak")}
                    </Button>

                    {setupCode && (
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(setupCode);
                            }}
                        >
                            {t("status.setupInstructions.copyCode")}
                        </Button>
                    )}
                </InlineStack>
            </Box>
        </BlockStack>
    );
}
