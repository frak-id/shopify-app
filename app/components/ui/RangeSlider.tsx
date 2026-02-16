interface RangeSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    output?: boolean;
    helpText?: string;
}

export function RangeSlider({
    label,
    value,
    min,
    max,
    step,
    onChange,
    output,
    helpText,
}: RangeSliderProps) {
    const inputId = `range-slider-${Math.random().toString(36).slice(2, 9)}`;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
                htmlFor={inputId}
                style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#202223",
                }}
            >
                {label}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                    id={inputId}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    style={
                        {
                            flex: 1,
                            height: "4px",
                            borderRadius: "2px",
                            background: "#e4e5e7",
                            outline: "none",
                            WebkitAppearance: "none",
                            appearance: "none",
                        } as React.CSSProperties & {
                            WebkitAppearance: string;
                        }
                    }
                />
                {output && (
                    <span
                        style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#202223",
                            minWidth: "40px",
                            textAlign: "right",
                        }}
                    >
                        {value}
                    </span>
                )}
            </div>
            {helpText && (
                <p
                    style={{
                        fontSize: "12px",
                        color: "#6d7175",
                        margin: "0",
                    }}
                >
                    {helpText}
                </p>
            )}
        </div>
    );
}
