import type { ReactNode } from "react";

interface CollapsibleProps {
    open: boolean;
    id: string;
    transition?: {
        duration: string;
        timingFunction: string;
    };
    children: ReactNode;
}

export function Collapsible({
    open,
    id,
    transition = { duration: "500ms", timingFunction: "ease-in-out" },
    children,
}: CollapsibleProps) {
    return (
        <div
            id={id}
            style={{
                maxHeight: open ? "1000px" : "0",
                overflow: "hidden",
                transition: `max-height ${transition.duration} ${transition.timingFunction}`,
            }}
        >
            {children}
        </div>
    );
}
