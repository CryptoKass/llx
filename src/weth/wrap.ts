import type { Abi } from "viem";
import { Pegasus, Phoenix, resolveChainRef, type ChainRef } from "../chains.js";
import type { PreparedTx } from "../common.js";

const WethABI: Abi = [
  // function deposit() public payable
  {
    name: "deposit",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export const prepareWrapTx = (
  chainRef: ChainRef,
  amount: bigint
): PreparedTx => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  if (!chain.weth) throw new Error("WETH not supported");

  const wethAddress = chain.weth as `0x${string}`;

  return {
    to: wethAddress,
    data: "0x",
    value: amount,
    description: "Wrapping ETH",
  };
};
