import type { ReactNode } from "react";

interface Tab {
    id: string;
    content: string;
}

interface TabsProps {
    tabs: Tab[];
    selected: number;
    onSelect: (index: number) => void;
    children?: ReactNode;
}

export function Tabs({ tabs, selected, onSelect, children }: TabsProps) {
    return (
        <div>
            <div
                role="tablist"
                style={{
                    display: "flex",
                    borderBottom: "1px solid #e5e5e5",
                    gap: 0,
                }}
            >
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={selected === index}
                        onClick={() => onSelect(index)}
                        style={{
                            padding: "12px 16px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: selected === index ? 600 : 400,
                            color: selected === index ? "#000" : "#6d7175",
                            borderBottom:
                                selected === index
                                    ? "2px solid #008060"
                                    : "none",
                            marginBottom: selected === index ? "-1px" : 0,
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            if (selected !== index) {
                                e.currentTarget.style.backgroundColor =
                                    "#f6f6f6";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selected !== index) {
                                e.currentTarget.style.backgroundColor =
                                    "transparent";
                            }
                        }}
                    >
                        {tab.content}
                    </button>
                ))}
            </div>
            {children && <div style={{ paddingTop: "16px" }}>{children}</div>}
        </div>
    );
}
