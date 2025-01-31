import { describe, expect, it } from "vitest";
import { fetchBalance } from "./balance.js";
import { Phoenix } from "../chains.js";

describe("balance", () => {
  it("should fetch balance", async () => {
    const balance = await fetchBalance(
      Phoenix.id,
      Phoenix.weth as `0x${string}`,
      "0x2Fe0Dd159b80994537f9F7BA62577F13B44bdd46"
    );
    expect(balance).toBeGreaterThan(0);
  });

  it("should throw error if chain is not supported", async () => {
    await expect(
      fetchBalance(
        1,
        Phoenix.weth as `0x${string}`,
        "0x2Fe0Dd159b80994537f9F7BA62577F13B44bdd46"
      )
    ).rejects.toThrow();
  });
});
