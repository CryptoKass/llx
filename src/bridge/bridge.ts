import { ChainId } from "@uniswap/sdk-core";
import { prepareStandardBridgeETHDeposit } from "./standard.js";
import type { Address } from "viem";
import { getChainById } from "../chains.js";

interface BridgeParams {
  amount: bigint;
  token?: "eth" | Address; // ETH or ERC20 Token address
  bridgeAddress?: Address;
  minGasLimit?: number;
}

export const bridge = (chainId: number, params: BridgeParams) => {
  if (params.token === "eth") {
    return prepareStandardBridgeETHDeposit(chainId, params);
  }

  throw new Error("Unsupported asset");
};
