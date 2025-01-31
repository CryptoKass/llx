import type { Address, Hex } from "viem";

export interface PreparedTx {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: bigint;
  gasLimit?: bigint;
  gasPrice?: bigint;
}
