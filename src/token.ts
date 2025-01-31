import type { Abi, Address, PublicClient } from "viem";
import { getSupportedPublicClient } from "./chains.js";

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

export const fetchTokenName = async (chainId: number, address: Address) => {
  const publicClient = getSupportedPublicClient(chainId);

  const name = await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "name",
  });

  return name as string;
};

export const fetchTokenSymbol = async (chainId: number, address: Address) => {
  const publicClient = getSupportedPublicClient(chainId);

  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "symbol",
  })) as string;
};

export const fetchTokenDecimals = async (chainId: number, address: Address) => {
  const publicClient = getSupportedPublicClient(chainId);

  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "decimals",
  })) as number;
};

export const fetchTokenTotalSupply = async (
  chainId: number,
  address: Address
) => {
  const publicClient = getSupportedPublicClient(chainId);

  return (await publicClient.readContract({
    address,
    abi: TokenABI,
    functionName: "totalSupply",
  })) as bigint;
};

export const fetchTokenInfo = async (chainId: number, address: Address) => {
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    fetchTokenName(chainId, address),
    fetchTokenSymbol(chainId, address),
    fetchTokenDecimals(chainId, address),
    fetchTokenTotalSupply(chainId, address),
  ]);

  return { name, symbol, decimals, totalSupply };
};
