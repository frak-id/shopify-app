interface ProgressBarProps {
    progress: number;
    size?: "small" | "medium";
    tone?: "primary" | "success";
}

export function ProgressBar({
    progress,
    size = "medium",
    tone = "primary",
}: ProgressBarProps) {
    const height = size === "small" ? "4px" : "8px";
    const fillColor = tone === "success" ? "#008060" : "#008060";
    const backgroundColor = "#e4e5e7";

    return (
        <div
            style={{
                width: "100%",
                height,
                backgroundColor,
                borderRadius: "4px",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    width: `${Math.min(Math.max(progress, 0), 100)}%`,
                    height: "100%",
                    backgroundColor: fillColor,
                    transition: "width 0.3s ease-in-out",
                }}
            />
        </div>
    );
}
