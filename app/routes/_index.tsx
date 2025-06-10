import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";

export const headers = () => {
    return {
        "Cache-Control":
            "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
        Vary: "Accept-Encoding",
    };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const search = request.url.split("?")[1];
    throw redirect(`/app${search ? `?${search}` : ""}`);
};

export default function App() {
    return null;
}
