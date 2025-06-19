import { BlockStack, Box, Button, Collapsible, Text } from "@shopify/polaris";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { StepItem } from ".";

interface CollapsibleStepProps {
    step: number;
    completed: boolean;
    title: string;
    description?: string;
    children?: ReactNode;
}

export function CollapsibleStep({
    step,
    completed,
    title,
    description,
    children,
}: CollapsibleStepProps) {
    const [open, setOpen] = useState(false);
    const handleToggle = useCallback(() => setOpen((open) => !open), []);

    useEffect(() => {
        if (!completed) return;
        setOpen(false);
    }, [completed]);

    return (
        <>
            <StepItem checked={completed}>
                {completed ? (
                    <Text variant="bodyMd" as="p">
                        {title}
                    </Text>
                ) : (
                    <Button
                        variant="plain"
                        onClick={handleToggle}
                        ariaExpanded={open}
                        ariaControls={`stepper-step${step}-collapsible`}
                    >
                        {title}
                    </Button>
                )}
            </StepItem>
            <Collapsible
                open={open}
                id={`stepper-step${step}-collapsible`}
                transition={{
                    duration: "500ms",
                    timingFunction: "ease-in-out",
                }}
            >
                <Box background="bg-surface-secondary" padding="400">
                    <div style={{ width: "fit-content" }}>
                        <BlockStack gap="400">
                            {description && (
                                <Text as="p" variant="bodyMd">
                                    {description}
                                </Text>
                            )}
                            {children}
                        </BlockStack>
                    </div>
                </Box>
            </Collapsible>
        </>
    );
}
