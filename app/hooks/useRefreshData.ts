import { useRevalidator } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useRefreshData() {
    const { revalidate } = useRevalidator();
    const queryClient = useQueryClient();

    return useCallback(() => {
        queryClient.refetchQueries().then(() => revalidate());
    }, [revalidate, queryClient]);
}
