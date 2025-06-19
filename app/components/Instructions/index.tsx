import { Badge, BlockStack, Box, Text } from "@shopify/polaris";
import { XSmallIcon } from "@shopify/polaris-icons";
import type { PropsWithChildren } from "react";

export function Instructions({
    badgeText,
    todoText,
    image,
    children,
}: PropsWithChildren<{
    badgeText: string;
    todoText: string;
    image: string;
}>) {
    return (
        <BlockStack gap="400">
            <Text as="p" variant="bodyMd">
                <Badge tone="critical" icon={XSmallIcon}>
                    {badgeText}
                </Badge>
            </Text>
            <Text as="p" variant="bodyMd">
                {todoText}
            </Text>
            <Box>
                <img src={image} alt="" />
            </Box>
            <Text as="p" variant="bodyMd">
                {children}
            </Text>
        </BlockStack>
    );
}
