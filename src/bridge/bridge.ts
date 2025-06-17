import { prepareStandardBridgeETHDeposit } from "./standard.js";
import type { Address } from "viem";
import { type ChainRef } from "../chains.js";

interface BridgeParams {
  amount: bigint;
  token?: "eth" | Address; // ETH or ERC20 Token address
  bridgeAddress?: Address;
  minGasLimit?: number;
}

export const prepareBridgeTransfer = (
  chainRef: ChainRef,
  params: BridgeParams
) => {
  if (params.token === "eth") {
    return prepareStandardBridgeETHDeposit(chainRef, params);
  }

  throw new Error("Unsupported asset");
};
