import {
  decodeEventLog,
  encodeFunctionData,
  parseEventLogs,
  keccak256,
  encodePacked,
  type Address,
  type Hex,
  type TransactionReceipt,
} from "viem";
import {
  getChainById,
  getPublicClient,
  resolveChainRef,
  type ChainRef,
} from "../chains.js";
import { ensureAllowance } from "../token/approval.js";
import { writeContract } from "viem/actions";
import type { PreparedTx } from "../common.js";
import type { BridgeParams } from "./bridge.js";

const L1ERC20PredicateABI = [
  {
    name: "deposit",
    inputs: [
      {
        internalType: "address",
        name: "_l1Token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  //   event DepositToken(bytes message);
  {
    name: "DepositToken",
    inputs: [
      {
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
    ],
    outputs: [],
    type: "event",
  },
] as const;

//  'function withdraw(address _l2Token, uint256 _amount) external',
const L2ERC20PredicateABI = [
  {
    name: "withdraw",
    inputs: [
      {
        internalType: "address",
        name: "_l2Token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  //   event WithdrawToken(bytes message);
  {
    name: "WithdrawToken",
    inputs: [
      {
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
    ],
    outputs: [],
    type: "event",
  },
] as const;

type PoaBridgeParams = BridgeParams;

export const preparePoaBridgeToL2 = async (
  chainRef: ChainRef,
  sender: Address,
  params: PoaBridgeParams
): Promise<PreparedTx[]> => {
  const { amount, token } = params;
  if (token === "eth") throw new Error("ETH is not supported for POA bridge");
  if (!token) throw new Error("Token is required");

  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);

  // ensure contract address is defined
  const l1ERC20Predicate = chain.bridge?.l1ERC20Predicate;
  if (!l1ERC20Predicate) throw new Error(`L1 ERC20 Predicate not found`);

  // 1. Ensure allowance is set
  const allowanceTxs = await ensureAllowance(
    chainRef,
    token,
    l1ERC20Predicate,
    sender,
    amount
  );

  // 2. Deposit to L2
  const depositeData = encodeFunctionData({
    abi: L1ERC20PredicateABI,
    functionName: "deposit",
    args: [token, amount],
  });

  return [
    ...allowanceTxs,
    {
      to: l1ERC20Predicate,
      data: depositeData,
      value: amount,
      description: "Bridge to L2 using POA bridge",
    },
  ];
};

export const preparePoaBridgeToL1 = async (
  chainRef: ChainRef,
  sender: Address,
  params: PoaBridgeParams
): Promise<PreparedTx[]> => {
  const { amount, token } = params;
  if (token === "eth") throw new Error("ETH is not supported for POA bridge");
  if (!token) throw new Error("Token is required");
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);

  // ensure contract address is defined
  const l2ERC20Predicate = chain.bridge?.l2ERC20Predicate;
  if (!l2ERC20Predicate) throw new Error(`L2 ERC20 Predicate not found`);

  // 1. Ensure allowance is set
  const allowanceTxs = await ensureAllowance(
    chainRef,
    token,
    l2ERC20Predicate,
    sender,
    amount
  );

  // 2. Withdraw from L2
  const withdrawData = encodeFunctionData({
    abi: L2ERC20PredicateABI,
    functionName: "withdraw",
    args: [token, amount],
  });

  return [
    ...allowanceTxs,
    {
      to: l2ERC20Predicate,
      data: withdrawData,
      description: "Bridge to L1 using POA bridge",
    },
  ];
};

export const preparePoaBridgeDeposit = async (
  chainRef: ChainRef,
  sender: Address,
  params: PoaBridgeParams
): Promise<PreparedTx[]> => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);

  if (chain.isL2) return preparePoaBridgeToL2(chainRef, sender, params);
  return preparePoaBridgeToL1(chainRef, sender, params);
};

export const hasPoaBridgeLogs = (receipt: TransactionReceipt) => {
  const l1Logs = parseEventLogs({
    abi: L1ERC20PredicateABI,
    logs: receipt.logs,
  });
  if (l1Logs.length > 0) return true;

  const l2Logs = parseEventLogs({
    abi: L2ERC20PredicateABI,
    logs: receipt.logs,
  });
  return l2Logs.length > 0;
};

export const extractPoaBridgeToL2TransferID = async (
  chainRef: ChainRef,
  txHash: Hex
) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);

  const publicClient = getPublicClient(chainRef);
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (!receipt) throw new Error(`Transaction ${txHash} not found`);

  // Parse logs to find DepositToken event
  const logs = parseEventLogs({
    abi: L1ERC20PredicateABI,
    logs: receipt.logs,
  });

  // Find the DepositToken event
  const depositEvent = logs.find((log) => log.eventName === "DepositToken");
  if (!depositEvent)
    throw new Error("DepositToken event not found in transaction logs");

  // Extract the message from the event
  const message = depositEvent.args.message as Hex;

  // Get chain ID
  const chainId = BigInt(chain.id);

  // Calculate keccak256(abi.encodePacked(chainId, message))
  const packed = encodePacked(["uint256", "bytes"], [chainId, message]);

  return keccak256(packed);
};

export const extractPoaBridgeToL1TransferID = async (
  chainRef: ChainRef,
  txHash: Hex
) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);

  const publicClient = getPublicClient(chainRef);
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (!receipt) throw new Error(`Transaction ${txHash} not found`);

  // Parse logs to find WithdrawToken event
  const logs = parseEventLogs({
    abi: L2ERC20PredicateABI,
    logs: receipt.logs,
  });

  const withdrawEvent = logs.find((log) => log.eventName === "WithdrawToken");
  if (!withdrawEvent)
    throw new Error("WithdrawToken event not found in transaction logs");

  const message = withdrawEvent.args.message as Hex;
  const chainId = BigInt(chain.id);
  const packed = encodePacked(["uint256", "bytes"], [chainId, message]);

  return keccak256(packed);
};
