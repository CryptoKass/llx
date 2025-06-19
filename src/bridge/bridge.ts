import { prepareStandardBridgeETHDeposit } from "./standard.js";
import type { Address } from "viem";
import { type ChainRef } from "../chains.js";
import { preparePoaBridgeDeposit } from "./poa.js";

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
