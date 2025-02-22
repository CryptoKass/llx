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
    UNISWAP_V3_FACTORY_ADDRESS: "0x7A5531FC6628e55f22ED2C6AD015B75948fC36F4",
    UNISWAP_V3_QUOTER_ADDRESS: "0x97e7D916aa065eADA70B317677fb8a4A5504F51f",
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
  permit2: string;
  weth: string;
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
  permit2: "0xB952578f3520EE8Ea45b7914994dcf4702cEe578",
  weth: "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73",
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
  permit2: "0x65b0dE86Df48d72aCdaF7E548b5C836663A0a4fa",
  weth: "0xF42991f02C07AB66cFEa282E7E482382aEB85461",
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
