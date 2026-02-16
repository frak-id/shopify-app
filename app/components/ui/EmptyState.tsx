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
                gap: "24px",
                textAlign: "center",
                alignItems: "center",
            }}
        >
            {image && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <img
                        src={image}
                        alt=""
                        style={{ maxWidth: "250px", height: "auto" }}
                    />
                </div>
            )}
            <h2
                style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#000",
                }}
            >
                {heading}
            </h2>
            {children && <div>{children}</div>}
            {action && (
                <button
                    onClick={action.onAction}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#008060",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                >
                    {action.content}
                </button>
            )}
            {footerContent && <div>{footerContent}</div>}
        </div>
    );
}
