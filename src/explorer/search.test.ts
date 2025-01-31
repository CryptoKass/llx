import { expect, describe, it } from "vitest";
import { lightlinkPegasus, lightlinkPhoenix } from "viem/chains";
import { search } from "./search.js";

describe("search", () => {
  it("should return a list of search items", async () => {
    const items = await search(lightlinkPhoenix.id, "lightlink.ll");
    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.type).toBe("ens_domain");
    expect(items[0]!.address).toBe(
      "0xcc7c9Bc55eB7447FE7f8F244738DF0C489ee1fA3"
    );
  });

  it("should throw an error if the chain is not supported", async () => {
    await expect(search(1, "lightlink.ll")).rejects.toThrow();
  });
});
