import { useQuery } from "@tanstack/react-query";
import { type Address, erc20Abi } from "viem";
import { multicall } from "viem/actions";
import { viemClient } from "../utils/viemClient";

/**
 * Get the info around the given token
 */
export function useTokenInfoWithBalance({
    token,
    wallet,
}: { token: Address; wallet: Address }) {
    return useQuery({
        queryKey: ["tokenInfo", token],
        queryFn: async () => {
            const [name, symbol, decimals, balance] = await multicall(
                viemClient,
                {
                    contracts: [
                        {
                            abi: erc20Abi,
                            address: token,
                            functionName: "name",
                        },
                        {
                            abi: erc20Abi,
                            address: token,
                            functionName: "symbol",
                        },
                        {
                            abi: erc20Abi,
                            address: token,
                            functionName: "decimals",
                        },
                        {
                            abi: erc20Abi,
                            address: token,
                            functionName: "balanceOf",
                            args: [wallet],
                        },
                    ],
                    allowFailure: false,
                }
            );

            return {
                name,
                symbol,
                decimals,
                balance,
            };
        },
    });
}
