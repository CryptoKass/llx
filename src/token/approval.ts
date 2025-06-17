import { encodeFunctionData, type Abi } from "viem";
import type { PreparedTx } from "../common.js";
import { getPublicClient, type ChainRef } from "../chains.js";

const TokenABI: Abi = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool", name: "success" }],
    stateMutability: "nonpayable",
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" },
    ],
    outputs: [{ type: "uint256", name: "allowance" }],
    stateMutability: "view",
  },
] as const;

export function prepareApprovalTx(
  token: `0x${string}`,
  target: `0x${string}`,
  amount: bigint
): PreparedTx {
  return {
    to: token,
    data: encodeFunctionData({
      abi: TokenABI,
      functionName: "approve",
      args: [target, amount],
    }),
    description: "Approving token to be spent by target",
  };
}

export async function fetchAllowance(
  chainRef: ChainRef,
  token: `0x${string}`,
  owner: `0x${string}`,
  spender: `0x${string}`
) {
  const publicClient = getPublicClient(chainRef);

  return (await publicClient.readContract({
    address: token,
    abi: TokenABI,
    functionName: "allowance",
    args: [owner, spender],
  })) as bigint;
}

export async function ensureAllowance(
  chainRef: ChainRef,
  token: `0x${string}`,
  owner: `0x${string}`,
  spender: `0x${string}`,
  amount: bigint
) {
  const txs: PreparedTx[] = [];

  const allowance = await fetchAllowance(chainRef, token, owner, spender);
  if (allowance < amount) {
    txs.push(prepareApprovalTx(token, spender, amount));
  }

  return txs;
}
