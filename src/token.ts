import type { Abi, Address, PublicClient } from "viem";

const TokenABI: Abi = [
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
];

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

export const fetchTokenName = async (
  publicClient: PublicClient,
  address: Address
) => {
  const name = await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "name",
  });

  return name as string;
};

export const fetchTokenSymbol = async (
  publicClient: PublicClient,
  address: Address
) => {
  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "symbol",
  })) as string;
};

export const fetchTokenDecimals = async (
  publicClient: PublicClient,
  address: Address
) => {
  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "decimals",
  })) as number;
};

export const fetchTokenTotalSupply = async (
  publicClient: PublicClient,
  address: Address
) => {
  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "totalSupply",
  })) as bigint;
};

export const fetchTokenInfo = async (
  publicClient: PublicClient,
  address: Address
) => {
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    fetchTokenName(publicClient, address),
    fetchTokenSymbol(publicClient, address),
    fetchTokenDecimals(publicClient, address),
    fetchTokenTotalSupply(publicClient, address),
  ]);

  return { name, symbol, decimals, totalSupply };
};
