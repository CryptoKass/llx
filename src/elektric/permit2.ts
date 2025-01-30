import {
  encodeFunctionData,
  type Abi,
  type PublicClient,
  type WalletClient,
} from "viem";

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

async function ensureApproval(
  publicClient: PublicClient,
  walletClient: WalletClient,
  token: `0x${string}`,
  target: `0x${string}`,
  amount: bigint
) {
  const [senderAddress] = await walletClient.getAddresses();
  if (!senderAddress) {
    throw new Error("No sender address found");
  }

  let allowance = (await publicClient.readContract({
    address: token,
    abi: TokenABI,
    functionName: "allowance",
    args: [senderAddress, target],
  })) as bigint;

  if (allowance < amount) {
    console.log("Approving token transfer", target, amount);
    const tx = await walletClient.sendTransaction({
      chain: walletClient.chain,
      to: token,
      account: senderAddress,
      data: encodeFunctionData({
        abi: TokenABI,
        functionName: "approve",
        args: [target, amount],
      }),
    });

    const receipt = await publicClient.getTransactionReceipt({ hash: tx });
    if (!receipt || receipt.status !== "success") {
      throw new Error("Transaction failed");
    }

    allowance = amount;
  }

  return allowance;
}

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

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export const ensurePermit2 = async (
  publicClient: PublicClient,
  walletClient: WalletClient,
  permit2: `0x${string}`,
  token: `0x${string}`,
  target: `0x${string}`,
  amount: bigint
) => {
  // Step 1. Ensure Permit2 is approved
  await ensureApproval(publicClient, walletClient, token, permit2, amount);
  const [senderAddress] = await walletClient.getAddresses();
  if (!senderAddress) {
    throw new Error("No sender address found");
  }

  // Step 2. Check if target is approved on Permit2
  const allowance = (await publicClient.readContract({
    address: permit2,
    abi: Permit2ABI,
    functionName: "allowance",
    args: [senderAddress, token, target],
  })) as bigint;
  if (allowance >= amount) {
    return;
  }

  // Step 3. Approve Permit2 on target
  const deadline = Math.floor(Date.now() / 1000) + ONE_DAY_IN_SECONDS;
  const tx = await walletClient.sendTransaction({
    chain: walletClient.chain,
    to: permit2,
    account: senderAddress,
    data: encodeFunctionData({
      abi: Permit2ABI,
      functionName: "approve",
      args: [token, target, amount, deadline],
    }),
  });

  const receipt = await publicClient.getTransactionReceipt({ hash: tx });
  if (!receipt || receipt.status !== "success") {
    throw new Error("Transaction failed");
  }

  return;
};
