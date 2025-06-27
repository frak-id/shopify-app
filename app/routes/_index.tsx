import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const search = request.url.split("?")[1];
    throw redirect(`/app${search ? `?${search}` : ""}`);
};

export default function App() {
    return null;
}
