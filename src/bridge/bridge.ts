import {
  extractStandardBridgeTransferID,
  hasStandardBridgeLogs,
  prepareStandardBridgeETHDeposit,
} from "./standard.js";
import type { Address, Hex } from "viem";
import { getPublicClient, resolveChainRef, type ChainRef } from "../chains.js";
import {
  extractPoaBridgeToL1TransferID,
  extractPoaBridgeToL2TransferID,
  hasPoaBridgeLogs,
  preparePoaBridgeDeposit,
} from "./poa.js";

export interface BridgeParams {
  amount: bigint;
  token?: "eth" | Address; // ETH or ERC20 Token address
  bridgeAddress?: Address;
  minGasLimit?: number;
}

export const prepareBridgeTransfer = (
  chainRef: ChainRef,
  sender: Address,
  params: BridgeParams
) => {
  if (params.token === "eth") {
    return prepareStandardBridgeETHDeposit(chainRef, params);
  }

  return preparePoaBridgeDeposit(chainRef, sender, params);
};

export const extractBridgeTransferID = async (
  chainRef: ChainRef,
  txHash: Hex
) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);

  const publicClient = getPublicClient(chainRef);
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (!receipt) throw new Error(`Transaction ${txHash} not found`);

  if (hasPoaBridgeLogs(receipt)) {
    if (chain.isL2)
      return await extractPoaBridgeToL2TransferID(chainRef, txHash);
    return await extractPoaBridgeToL1TransferID(chainRef, txHash);
  }
  if (hasStandardBridgeLogs(receipt))
    return await extractStandardBridgeTransferID(chainRef, txHash);

  throw new Error("No bridge logs found");
};
