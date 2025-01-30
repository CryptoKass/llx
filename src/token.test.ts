import { describe, expect, test } from "vitest";
import { getTokenDetails } from "./token.js";
import { lightlinkPegasus } from "viem/chains";
import { lightlinkPhoenix } from "./chains.js";
import { createPublicClient, http } from "viem";

describe("Token", () => {
  const publicClient = createPublicClient({
    chain: lightlinkPhoenix,
    transport: http(),
  });

  test("should be able to get the token details", async () => {
    const token = await getTokenDetails(
      publicClient,
      "0x18fB38404DADeE1727Be4b805c5b242B5413Fa40"
    );
    expect(token.name).toBe("USD Coin");
    expect(token.symbol).toBe("USDC.e");
    expect(token.decimals).toBe(6);
    expect(token.totalSupply).toBeGreaterThan(0n);
  });
});
