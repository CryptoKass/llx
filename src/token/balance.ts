import type { Abi, Address } from "viem";
import { getSupportedPublicClient } from "../chains.js";

const TokenABI: Abi = [
  {
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
    stateMutability: "view",
  },
] as const;

export const fetchBalance = async (
  chainId: number,
  token: Address,
  account: Address
) => {
  const publicClient = getSupportedPublicClient(chainId);

  return (await publicClient.readContract({
    address: token,
    abi: TokenABI,
    functionName: "balanceOf",
    args: [account],
  })) as bigint;
};
