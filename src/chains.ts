import { createPublicClient, defineChain, http } from "viem";
import { lightlinkPegasus, lightlinkPhoenix } from "viem/chains";

const CONTRACTS = {
  lightlink: {
    UNIVERSAL_ROUTER: "0x6B3ea22C757BbF9C78CcAaa2eD9562b57001720B",
    UNISWAP_V3_FACTORY_ADDRESS: "0xEE6099234bbdC793a43676D98Eb6B589ca7112D7",
    UNISWAP_V3_QUOTER_ADDRESS: "0x243551e321Dac40508c22de2E00aBECF17F764b5",
  },

  lightlinkTestnet: {
    UNIVERSAL_ROUTER: "0x742d315e929B188e3F05FbC49774474a627b0502",
    UNISWAP_V3_FACTORY_ADDRESS: "0x1F98431c8aD98523631AE4a59f267346364d5Db4",
    UNISWAP_V3_QUOTER_ADDRESS: "0x0000000000000000000000000000000000000000",
  },
};

interface Network {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  elektrik: {
    quoter: string;
    router: string;
    factory: string;
  };
  ens?: { resolver: string };
}

export const Phoenix: Network = {
  id: 1890,
  name: "Lightlink Phoenix",
  rpcUrl: process.env.LIGHTLINK_MAINNET_RPC_URL || "",
  explorerUrl: "https://phoenix.lightlink.io",
  elektrik: {
    quoter: CONTRACTS.lightlink.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlink.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlink.UNISWAP_V3_FACTORY_ADDRESS,
  },
};

export const Pegasus: Network = {
  id: 1891,
  name: "Lightlink Pegasus",
  rpcUrl: process.env.LIGHTLINK_TESTNET_RPC_URL || "",
  explorerUrl: "https://pegasus.lightlink.io",
  elektrik: {
    quoter: CONTRACTS.lightlinkTestnet.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlinkTestnet.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlinkTestnet.UNISWAP_V3_FACTORY_ADDRESS,
  },
};

export const getSupportedPublicClient = (id: number) => {
  if (id != Phoenix.id && id != Pegasus.id) {
    throw new Error("Unsupported chain");
  }

  const chain = id == Phoenix.id ? lightlinkPhoenix : lightlinkPegasus;

  return createPublicClient({
    chain: chain,
    transport: http(),
  });
};
