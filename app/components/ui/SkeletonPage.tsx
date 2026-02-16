import type React from "react";

const pulseStyle: React.CSSProperties = {
    backgroundColor: "#e4e5e7",
    borderRadius: "4px",
    animation: "skeleton-pulse 1.5s ease-in-out infinite",
};

export function SkeletonPage({
    children,
}: {
    children?: React.ReactNode;
}): React.ReactElement {
    return (
        <>
            <style>{`
                @keyframes skeleton-pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }
            `}</style>
            <div style={{ padding: "16px" }}>
                <div
                    style={{
                        ...pulseStyle,
                        height: "32px",
                        width: "60%",
                        marginBottom: "24px",
                    }}
                />
                {children}
            </div>
        </>
    );
}
