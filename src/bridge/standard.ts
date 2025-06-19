import { encodeFunctionData, type Address } from "viem";
import type { PreparedTx } from "../common.js";
import { getChainById, resolveChainRef, type ChainRef } from "../chains.js";

const StandardBridgeABI = [
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_minGasLimit",
        type: "uint32",
      },
      {
        internalType: "bytes",
        name: "_extraData",
        type: "bytes",
      },
    ],
    name: "bridgeETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

interface StandardBridgeDepositParams {
  amount: bigint;
  bridgeAddress?: Address;
  minGasLimit?: number;
}

export const prepareStandardBridgeETHDeposit = (
  chainRef: ChainRef,
  params: StandardBridgeDepositParams
) => {
  const txs: PreparedTx[] = [];

  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");

  const standardBridgeAddress =
    params.bridgeAddress ?? chain.bridge?.standardBridge;
  if (!standardBridgeAddress) throw new Error("Standard bridge not found");

  const encodedData = encodeFunctionData({
    abi: StandardBridgeABI,
    functionName: "bridgeETH",
    args: [params.minGasLimit ?? 30000, "0x"],
  });

  txs.push({
    to: standardBridgeAddress,
    data: encodedData,
    value: params.amount,
    description: "Bridge ETH using the standard bridge",
  });

  return txs;
};
