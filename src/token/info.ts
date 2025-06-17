import type { Abi, Address } from "viem";
import { getPublicClient, type ChainRef } from "../chains.js";

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

export const fetchTokenName = async (chainRef: ChainRef, address: Address) => {
  const publicClient = getPublicClient(chainRef);

  const name = await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "name",
  });

  return name as string;
};

export const fetchTokenSymbol = async (
  chainRef: ChainRef,
  address: Address
) => {
  const publicClient = getPublicClient(chainRef);

  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "symbol",
  })) as string;
};

export const fetchTokenDecimals = async (
  chainRef: ChainRef,
  address: Address
) => {
  const publicClient = getPublicClient(chainRef);

  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "decimals",
  })) as number;
};

export const fetchTokenTotalSupply = async (
  chainRef: ChainRef,
  address: Address
) => {
  const publicClient = getPublicClient(chainRef);

  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "totalSupply",
  })) as bigint;
};

export const fetchTokenInfo = async (chainRef: ChainRef, address: Address) => {
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    fetchTokenName(chainRef, address),
    fetchTokenSymbol(chainRef, address),
    fetchTokenDecimals(chainRef, address),
    fetchTokenTotalSupply(chainRef, address),
  ]);

  return { name, symbol, decimals, totalSupply };
};
