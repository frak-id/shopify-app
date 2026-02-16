import type React from "react";

const pulseStyle: React.CSSProperties = {
    backgroundColor: "#e4e5e7",
    borderRadius: "4px",
    animation: "skeleton-pulse 1.5s ease-in-out infinite",
};

const widths = ["100%", "90%", "95%", "85%", "70%"];

export function SkeletonBodyText({
    lines = 3,
}: {
    lines?: number;
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
            <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
                {Array.from({ length: lines }).map((_, index) => {
                    const lineId = `line-${lines}-${index}`;
                    return (
                        <div
                            key={lineId}
                            style={{
                                ...pulseStyle,
                                height: "12px",
                                width: widths[index % widths.length],
                            }}
                        />
                    );
                })}
            </div>
        </>
    );
}
