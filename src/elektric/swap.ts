import {
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  type Abi,
  type PublicClient,
  type WalletClient,
} from "viem";
import { ensurePermit2 } from "./permit2.js";

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

export const swapExactInput = async (
  publicClient: PublicClient,
  walletClient: WalletClient,
  universalRouterAddress: `0x${string}`,
  permit2Address: `0x${string}`,
  params: SwapExactInputParams
) => {
  const [senderAddress] = await walletClient.getAddresses();
  if (!senderAddress) throw new Error("No sender address");

  // Step 1. Ensure Permit2 is approved
  await ensurePermit2(
    publicClient,
    walletClient,
    permit2Address,
    params.tokenIn,
    universalRouterAddress,
    params.amountIn
  );

  // Step 2. Calculate minimum amount out
  const slippageBP = BigInt(params.slippage * 10000);
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
    [senderAddress, params.amountIn, minAmountOut, route, true]
  );

  const data = encodeFunctionData({
    functionName: "swapExactInput",
    abi: UniversalRouterABI,
    args: [inputs],
  });

  // step 5. execute the swap
  const tx = await walletClient.sendTransaction({
    chain: walletClient.chain,
    to: universalRouterAddress,
    account: senderAddress,
    data,
  });

  return {
    txHash: tx,
    minAmountOut: minAmountOut,
  } as SwapExactInputResult;
};
