import { encodeFunctionData, type Abi } from "viem";
import { Pegasus, Phoenix } from "../chains.js";
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
  chainId: number,
  amount: bigint
): PreparedTx => {
  const wethAddress =
    chainId == Phoenix.id
      ? (Phoenix.weth as `0x${string}`)
      : (Pegasus.weth as `0x${string}`);

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
