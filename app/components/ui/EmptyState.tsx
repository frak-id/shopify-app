import type { ReactNode } from "react";

interface EmptyStateAction {
    content: string;
    onAction: () => void;
}

interface EmptyStateProps {
    heading: string;
    action?: EmptyStateAction;
    footerContent?: ReactNode;
    image?: string;
    children?: ReactNode;
}

export function EmptyState({
    heading,
    action,
    footerContent,
    image,
    children,
}: EmptyStateProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                alignItems: "center",
            }}
        >
            {image && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <img
                        src={image}
                        alt=""
                        style={{ maxWidth: "250px", height: "auto" }}
                    />
                </div>
            )}
            <h2
                style={{
                    margin: "0",
                    fontWeight: 600,
                    color: "#303030",
                }}
            >
                {heading}
            </h2>
            {children && (
                <div
                    style={{
                        color: "#616161",
                    }}
                >
                    {children}
                </div>
            )}
            {action && (
                <s-button variant="primary" onClick={action.onAction}>
                    {action.content}
                </s-button>
            )}
            {footerContent && (
                <div style={{ color: "#616161" }}>{footerContent}</div>
            )}
        </div>
    );
}
