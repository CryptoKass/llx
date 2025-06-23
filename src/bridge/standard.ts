import {
  encodeFunctionData,
  type Hex,
  keccak256,
  encodeAbiParameters,
  parseEventLogs,
  type TransactionReceipt,
} from "viem";
import type { PreparedTx } from "../common.js";
import { getPublicClient, resolveChainRef, type ChainRef } from "../chains.js";
import type { BridgeParams } from "./bridge.js";

// const StandardBridgeABI = [
//   {
//     inputs: [
//       {
//         internalType: "uint32",
//         name: "_minGasLimit",
//         type: "uint32",
//       },
//       {
//         internalType: "bytes",
//         name: "_extraData",
//         type: "bytes",
//       },
//     ],
//     name: "bridgeETH",
//     outputs: [],
//     stateMutability: "payable",
//     type: "function",
//   },
// ] as const;

type StandardBridgeDepositParams = BridgeParams;

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

  txs.push({
    to: standardBridgeAddress,
    data: "0x",
    value: params.amount,
    description: "Bridge ETH using the standard bridge",
  });

  return txs;
};

const CrossDomainMessengerABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "messageNonce",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasLimit",
        type: "uint256",
      },
    ],
    name: "SentMessage",
    type: "event",
  },
] as const;

export const hasStandardBridgeLogs = (receipt: TransactionReceipt) => {
  const logs = parseEventLogs({
    abi: CrossDomainMessengerABI,
    eventName: "SentMessage",
    logs: receipt.logs,
  });

  return logs.length > 0;
};

export const extractStandardBridgeTransferID = async (
  chainRef: ChainRef,
  txHash: Hex
) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);

  // Create a public client to fetch transaction data
  const client = getPublicClient(chainRef);

  // Get the transaction receipt
  const receipt = await client.getTransactionReceipt({ hash: txHash });

  // Parse the SentMessage event from the logs
  const logs = parseEventLogs({
    abi: CrossDomainMessengerABI,
    eventName: "SentMessage",
    logs: receipt.logs,
  });

  if (logs.length === 0) {
    throw new Error("SentMessage event not found in transaction");
  }

  const sentMessageEvent = logs[0]!;
  const { target, sender, message, messageNonce, gasLimit } =
    sentMessageEvent.args;

  // Encode the cross domain message (equivalent to encodeCrossDomainMessageV1)
  const encodedMessage = encodeAbiParameters(
    [
      { type: "bytes4" }, // function selector
      { type: "uint256" }, // nonce
      { type: "address" }, // sender
      { type: "address" }, // target
      { type: "uint256" }, // value (0 for ETH bridges)
      { type: "uint256" }, // gasLimit
      { type: "bytes" }, // data
    ],
    [
      "0xd764ad0b", // relayMessage function selector
      messageNonce,
      sender,
      target,
      0n, // value is 0 for standard ETH bridge
      gasLimit,
      message,
    ]
  );

  return keccak256(encodedMessage);
};
