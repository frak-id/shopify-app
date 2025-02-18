import { Button, Collapsible as PolarisCollapsible } from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

export function Collapsible({
    title,
    children,
    defaultOpen,
    id,
}: { title: string; children: ReactNode; defaultOpen?: boolean; id?: string }) {
    const [open, setOpen] = useState(defaultOpen ?? false);
    const handleToggle = useCallback(() => setOpen((open) => !open), []);

    useEffect(() => {
        setOpen(defaultOpen ?? false);
    }, [defaultOpen]);

    const collapsibleId = id ?? "basic-collapsible";

    return (
        <>
            <Button
                onClick={handleToggle}
                ariaExpanded={open}
                ariaControls={collapsibleId}
            >
                {title}
            </Button>
            <PolarisCollapsible
                open={open}
                id={collapsibleId}
                transition={{
                    duration: "500ms",
                    timingFunction: "ease-in-out",
                }}
                expandOnPrint
            >
                {children}
            </PolarisCollapsible>
        </>
    );
}
