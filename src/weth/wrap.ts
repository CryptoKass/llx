import type { Abi, Address } from "viem";
import { withdraw } from "viem/zksync";
import { getSupportedPublicClient, Pegasus, Phoenix } from "../chains.js";
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

export const prepareWrapTx = (chainId: number, amount: bigint): PreparedTx => {
  const wethAddress =
    chainId == Phoenix.id
      ? (Phoenix.weth as `0x${string}`)
      : (Pegasus.weth as `0x${string}`);

  return {
    to: wethAddress,
    data: "0x",
    value: amount,
    description: "Wrapping ETH",
  };
};
