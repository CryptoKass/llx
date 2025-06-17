import { describe, expect, test } from "vitest";
import { quoteExactInput } from "./quote.js";
import { createPublicClient, http, type Address } from "viem";
import { lightlinkPhoenix } from "viem/chains";
import { Phoenix } from "../chains.js";

describe("Quote", () => {
  test("should be able to get a quote", async () => {
    const fromToken = "0xbcf8c1b03bbdda88d579330bdf236b58f8bb2cfd"; // USDC.e
    const toToken = "0x7ebef2a4b1b09381ec5b9df8c5c6f2dbeca59c73"; // WETH

    const quote = await quoteExactInput(Phoenix.id, {
      fromToken,
      toToken,
      amountIn: 1n * 10n ** 6n,
      fee: 3000,
    });

    expect(quote.amountOut).toBeGreaterThan(0n);
  });
});
