import { describe, expect, test } from "vitest";
import { quoteExactInput } from "./quote.js";
import { createPublicClient, http, type Address } from "viem";
import { lightlinkPhoenix } from "viem/chains";
import { Phoenix } from "../chains.js";

describe("Quote", () => {
  test("should be able to get a quote", async () => {
    const fromToken = "0x18fB38404DADeE1727Be4b805c5b242B5413Fa40";
    const toToken = "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73";

    const quote = await quoteExactInput(Phoenix.id, {
      fromToken,
      toToken,
      amountIn: 1n * 10n ** 6n,
      fee: 3000,
    });

    expect(quote.amountOut).toBeGreaterThan(0n);
  });
});
