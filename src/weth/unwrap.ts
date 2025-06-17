import { encodeFunctionData, type Abi } from "viem";
import { resolveChainRef, type ChainRef } from "../chains.js";
import type { PreparedTx } from "../common.js";

const WETH_ABI: Abi = [
  // function withdraw(uint wad) public
  {
    name: "withdraw",
    inputs: [{ name: "wad", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const prepareUnwrapTx = (
  chainRef: ChainRef,
  amount: bigint
): PreparedTx => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  if (!chain.weth) throw new Error("WETH not supported");

  const wethAddress = chain.weth as `0x${string}`;

  return {
    to: wethAddress,
    data: encodeFunctionData({
      abi: WETH_ABI,
      functionName: "withdraw",
      args: [amount],
    }),
    description: "Unwrapping WETH",
  };
};
