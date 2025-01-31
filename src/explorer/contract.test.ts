import { expect, describe, it } from "vitest";
import { getContractInfo, type VerifiedContract } from "./contract.js";
import { lightlinkPhoenix } from "../chains.js";

describe("contract", () => {
  it("should be able to get contract info", async () => {
    const info = await getContractInfo(
      lightlinkPhoenix.id,
      "0xd9d7123552fA2bEdB2348bB562576D67f6E8e96E" // lightlink coin
    );
    expect(info).toBeDefined();
    expect(info.is_verified).toBe(true);

    const verified = info as VerifiedContract;
    expect(verified.name).toBe("TokenProxy");
  });

  it("should throw an error if the chain is not supported", async () => {
    await expect(
      getContractInfo(1, "0xd9d7123552fA2bEdB2348bB562576D67f6E8e96E")
    ).rejects.toThrow();
  });
});
