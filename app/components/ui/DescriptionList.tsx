import type { ReactNode } from "react";

interface DescriptionListItem {
    term: string;
    description: ReactNode;
}

interface DescriptionListProps {
    items: DescriptionListItem[];
}

export function DescriptionList({ items }: DescriptionListProps) {
    return (
        <dl style={{ margin: 0, padding: 0 }}>
            {items.map((item) => (
                <div key={item.term}>
                    <dt
                        style={{
                            fontWeight: 600,
                            color: "#6d7175",
                            marginBottom: "4px",
                            fontSize: "14px",
                        }}
                    >
                        {item.term}
                    </dt>
                    <dd
                        style={{
                            margin: 0,
                            marginLeft: 0,
                            marginBottom: "16px",
                            fontSize: "14px",
                        }}
                    >
                        {item.description}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
