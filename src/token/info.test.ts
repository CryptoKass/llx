import { describe, expect, test } from "vitest";
import { fetchTokenInfo } from "./info.js";
import { lightlinkPhoenix } from "viem/chains";

describe("info", () => {
  const chainId = lightlinkPhoenix.id;

  test("should be able to get the token details", async () => {
    const token = await fetchTokenInfo(
      chainId,
      "0x18fB38404DADeE1727Be4b805c5b242B5413Fa40"
    );
    expect(token.name).toBe("USD Coin");
    expect(token.symbol).toBe("USDC.e");
    expect(token.decimals).toBe(6);
    expect(token.totalSupply).toBeGreaterThan(0n);
  });
});
