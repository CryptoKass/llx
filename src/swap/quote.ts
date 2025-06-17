import {
  decodeFunctionResult,
  encodeFunctionData,
  type Abi,
  type Address,
  type PublicClient,
} from "viem";
import { getPublicClient, resolveChainRef, type ChainRef } from "../chains.js";

const QuoterABI: Abi = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct IQuoterV2.QuoteExactInputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      {
        internalType: "uint160",
        name: "sqrtPriceX96After",
        type: "uint160",
      },
      {
        internalType: "uint32",
        name: "initializedTicksCrossed",
        type: "uint32",
      },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export interface QuoteExactInputSingleParams {
  fromToken: `0x${string}`;
  toToken: `0x${string}`;
  amountIn: bigint;
  fee: number;
}

export interface QuoteResult {
  amountOut: bigint;
  sqrtPriceX96After: bigint;
  initializedTicksCrossed: bigint;
  gasEstimate: bigint;
}

export const quoteExactInput = async (
  chainRef: ChainRef,
  params: QuoteExactInputSingleParams
): Promise<QuoteResult> => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  if (!chain.uniswapv3) throw new Error("Uniswap V3 not supported");

  const client = getPublicClient(chainRef);
  const quoterContractAddress = chain.uniswapv3.quoter as `0x${string}`;
  return _quoteExactInput(client, quoterContractAddress as Address, params);
};

const _quoteExactInput = async (
  client: PublicClient,
  quoterContractAddress: `0x${string}`,
  params: QuoteExactInputSingleParams
) => {
  const { fromToken, toToken, amountIn, fee } = params;
  // Prepare the call
  const encodedData = encodeFunctionData({
    abi: QuoterABI,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: fromToken,
        tokenOut: toToken,
        amountIn: amountIn,
        fee: fee,
        sqrtPriceLimitX96: 0n, // no limit
      },
    ],
  });

  // Perform the static call
  const response = await client.call({
    to: quoterContractAddress,
    data: encodedData,
  });

  // Decode the response
  const result = decodeFunctionResult({
    abi: QuoterABI,
    functionName: "quoteExactInputSingle",
    data: response.data!,
  }) as [bigint, bigint, bigint, bigint];

  // Extract the individual outputs
  const quotedAmountOut = result[0];
  const sqrtPriceX96After = result[1];
  const initializedTicksCrossed = result[2];
  const gasEstimate = result[3];

  return {
    amountOut: quotedAmountOut,
    sqrtPriceX96After,
    initializedTicksCrossed,
    gasEstimate,
  } as QuoteResult;
};
