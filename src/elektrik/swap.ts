import {
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  type Abi,
  type PublicClient,
  type WalletClient,
} from "viem";
import { getSupportedPublicClient, Pegasus, Phoenix } from "../chains.js";
import { ensurePermit2Allowance } from "../token/permit2.js";
import type { PreparedTx } from "../common.js";

export interface SwapExactInputParams {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: bigint;
  amountOut: bigint;
  fee: number;
  slippage: number;
}

export interface SwapExactInputResult {
  txHash: `0x${string}`;
  minAmountOut: bigint;
}

const SWAP_EXACT_IN = "0x00";

const UniversalRouterABI: Abi = [
  {
    inputs: [
      { internalType: "bytes", name: "commands", type: "bytes" },
      { internalType: "bytes[]", name: "inputs", type: "bytes[]" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export const prepareSwapExactInput = async (
  chainId: number,
  sender: `0x${string}`,
  params: SwapExactInputParams
) => {
  if (params.slippage < 0 || params.slippage > 1)
    throw new Error("Slippage must be between 0 and 1");

  const txs: PreparedTx[] = [];

  const universalRouterAddress =
    chainId == Phoenix.id
      ? (Phoenix.elektrik.router as `0x${string}`)
      : (Pegasus.elektrik.router as `0x${string}`);

  // Step 1. Ensure Permit2 is approved
  txs.push(
    ...(await ensurePermit2Allowance(
      chainId,
      params.tokenIn,
      sender,
      universalRouterAddress,
      params.amountIn + BigInt(1)
    ))
  );

  // Step 2. Calculate minimum amount out
  const slippageBP = BigInt(Math.floor(params.slippage * 10000));
  const minAmountOut =
    params.amountOut - (params.amountOut * slippageBP) / 10000n;

  // Step 3. encode the swap route
  const route = encodePacked(
    ["address", "uint24", "address"],
    [params.tokenIn, params.fee, params.tokenOut]
  );

  // step 4. encode the inputs for V3_SWAP_EXACT_IN
  const inputs = encodeAbiParameters(
    [
      { type: "address" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "bytes" },
      { type: "bool" },
    ],
    [sender, params.amountIn, minAmountOut, route, true]
  );

  const data = encodeFunctionData({
    functionName: "execute",
    abi: UniversalRouterABI,
    args: [SWAP_EXACT_IN, [inputs]],
  });

  // step 5. execute the swap
  txs.push({
    to: universalRouterAddress,
    data,
    description: "Executing swap via Universal Router",
  });

  return txs;
};
