import { createWeb3Name } from "@web3-name-sdk/core";
import { tldNamehash } from "@web3-name-sdk/core/utils";
import { createPublicClient, http, type Abi, type Address } from "viem";
import { normalize } from "viem/ens";
import { lightlinkPhoenix } from "./chains.js";

// "function resolver(bytes32 node) external view returns (address)",
const ENSRegistryABI: Abi = [
  {
    name: "resolver",
    type: "function",
    inputs: [{ type: "bytes32", name: "node" }],
    outputs: [{ type: "address", name: "resolver" }],
    stateMutability: "view",
  },
] as const;

// "function addr(bytes32 node) external view returns (address)",
const ENSResolverABI: Abi = [
  {
    name: "addr",
    type: "function",
    inputs: [{ type: "bytes32", name: "node" }],
    outputs: [{ type: "address", name: "addr" }],
    stateMutability: "view",
  },
] as const;

export const resolveEnsDomain = async (name: string) => {
  // extract the tld and normalize the domain
  const tld = name.split(".").pop();
  const normalizedDomain = normalize(name);

  // if its a .ll domain, use the custom resolver
  if (tld === "ll") {
    return resolveLLDomain(normalizedDomain);
  }

  // otherwise just use web3-name-sdk to get the address
  const web3Name = createWeb3Name();
  const address = await web3Name.getAddress(name);
  return address as Address;
};

const LL_IDENTIFIER =
  50980310089186268088337308227696701776159000940410532847939554039755637n;
const LL_REGISTRY_ADDRESS =
  "0x5dC881dDA4e4a8d312be3544AD13118D1a04Cb17" as Address;

export const resolveLLDomain = async (normalizedDomain: string) => {
  const nameHash = tldNamehash(normalizedDomain, LL_IDENTIFIER);

  const publicClient = createPublicClient({
    transport: http(),
    chain: lightlinkPhoenix,
  });

  // step 1. get the resolver
  const resolver = (await publicClient.readContract({
    address: LL_REGISTRY_ADDRESS,
    abi: ENSRegistryABI,
    functionName: "resolver",
    args: [nameHash],
  })) as Address;

  // step 2. get the address
  const address = await publicClient.readContract({
    address: resolver,
    abi: ENSResolverABI,
    functionName: "addr",
    args: [nameHash],
  });

  return address as Address;
};
