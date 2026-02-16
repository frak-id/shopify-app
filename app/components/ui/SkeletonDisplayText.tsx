import type React from "react";

const pulseStyle: React.CSSProperties = {
    backgroundColor: "#e4e5e7",
    borderRadius: "4px",
    animation: "skeleton-pulse 1.5s ease-in-out infinite",
};

const sizeMap = {
    small: 20,
    medium: 28,
    large: 36,
} as const;

export function SkeletonDisplayText({
    size = "medium",
}: {
    size?: "small" | "medium" | "large";
}): React.ReactElement {
    const height = sizeMap[size];

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
            <div
                style={{
                    ...pulseStyle,
                    height: `${height}px`,
                    width: "60%",
                }}
            />
        </>
    );
}
