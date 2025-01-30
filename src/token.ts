import type { Abi, Address, PublicClient } from "viem";
import { readContract } from "viem/actions";

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

export interface TokenDetails {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

export const getTokenName = async (
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

export const getTokenSymbol = async (
  publicClient: PublicClient,
  address: Address
) => {
  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "symbol",
  })) as string;
};

export const getTokenDecimals = async (
  publicClient: PublicClient,
  address: Address
) => {
  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "decimals",
  })) as number;
};

export const getTokenTotalSupply = async (
  publicClient: PublicClient,
  address: Address
) => {
  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "totalSupply",
  })) as bigint;
};

export const getTokenDetails = async (
  publicClient: PublicClient,
  address: Address
) => {
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    getTokenName(publicClient, address),
    getTokenSymbol(publicClient, address),
    getTokenDecimals(publicClient, address),
    getTokenTotalSupply(publicClient, address),
  ]);

  return { name, symbol, decimals, totalSupply };
};
