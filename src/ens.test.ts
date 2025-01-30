import { describe, expect, test } from "vitest";
import { resolveEnsDomain } from "./ens.js";

describe("ENS", () => {
  test("should be able to resolve an ENS name", async () => {
    const ens = await resolveEnsDomain("vitalik.eth");
    expect(ens).toBe("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  });

  test("should be able to resolve an LL domain", async () => {
    const ens = await resolveEnsDomain("lightlink.ll");
    expect(ens).toBe("0xcc7c9Bc55eB7447FE7f8F244738DF0C489ee1fA3");
  });
});
