import { encodeFunctionData, type Abi } from "viem";
import type { PreparedTx } from "../common.js";
import { getSupportedPublicClient, Pegasus, Phoenix } from "../chains.js";
import { ensureAllowance } from "./approval.js";

const Permit2ABI: Abi = [
  {
    name: "allowance",
    type: "function",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "token" },
      { type: "address", name: "spender" },
    ],
    outputs: [{ type: "uint256", name: "allowance" }],
    stateMutability: "view",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint160", name: "amount", type: "uint160" },
      { internalType: "uint48", name: "expiration", type: "uint48" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function preparePermit2ApprovalTx(
  chainId: number,
  token: `0x${string}`,
  target: `0x${string}`,
  amount: bigint,
  deadline: number
): PreparedTx {
  const permit2 =
    chainId == Phoenix.id
      ? (Phoenix.permit2 as `0x${string}`)
      : (Pegasus.permit2 as `0x${string}`);

  return {
    to: permit2,
    data: encodeFunctionData({
      abi: Permit2ABI,
      functionName: "approve",
      args: [token, target, amount, deadline],
    }),
    description: "Using Permit2 to approve the target to spend the token",
  };
}

export async function fetchPermit2Allowance(
  chainId: number,
  owner: `0x${string}`,
  token: `0x${string}`,
  spender: `0x${string}`
) {
  const publicClient = getSupportedPublicClient(chainId);

  const permit2 =
    chainId == Phoenix.id
      ? (Phoenix.permit2 as `0x${string}`)
      : (Pegasus.permit2 as `0x${string}`);

  return (await publicClient.readContract({
    address: permit2,
    abi: Permit2ABI,
    functionName: "allowance",
    args: [owner, token, spender],
  })) as bigint;
}

const ONE_DAY_IN_SECONDS = 86400;

export async function ensurePermit2Allowance(
  chainId: number,
  token: `0x${string}`,
  owner: `0x${string}`,
  spender: `0x${string}`,
  amount: bigint
) {
  const txs: PreparedTx[] = [];

  const permit2 =
    chainId == Phoenix.id
      ? (Phoenix.permit2 as `0x${string}`)
      : (Pegasus.permit2 as `0x${string}`);

  // Step 1. Ensure Permit2 has
  txs.push(...(await ensureAllowance(chainId, token, owner, permit2, amount)));

  // Step 2. Check if target is approved on Permit2
  const allowance = await fetchPermit2Allowance(chainId, owner, token, spender);
  if (allowance >= amount) {
    return txs;
  }

  // Step 3. Approve Permit2 on target
  const deadline = Math.floor(Date.now() / 1000) + ONE_DAY_IN_SECONDS;
  txs.push(preparePermit2ApprovalTx(chainId, token, spender, amount, deadline));

  return txs;
}
