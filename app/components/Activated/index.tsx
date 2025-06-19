import { Badge, Text } from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";

export function Activated({ text }: { text: string }) {
    return (
        <Text as="p" variant="bodyMd">
            <Badge tone="success" icon={CheckIcon}>
                {text}
            </Badge>
        </Text>
    );
}
