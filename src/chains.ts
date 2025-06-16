import { createPublicClient, defineChain, http } from "viem";
import { lightlinkPegasus, lightlinkPhoenix } from "viem/chains";

const CONTRACTS = {
  lightlink: {
    UNIVERSAL_ROUTER: "0x738fD6d10bCc05c230388B4027CAd37f82fe2AF2",
    UNISWAP_V3_FACTORY_ADDRESS: "0xcb2436774C3e191c85056d248EF4260ce5f27A9D",
    UNISWAP_V3_QUOTER_ADDRESS: "0x5911cB3633e764939edc2d92b7e1ad375Bb57649",
    LIGHTLINK_PORTAL: "",
  },

  lightlinkTestnet: {
    UNIVERSAL_ROUTER: "0x742d315e929B188e3F05FbC49774474a627b0502",
    UNISWAP_V3_FACTORY_ADDRESS: "0x7A5531FC6628e55f22ED2C6AD015B75948fC36F4",
    UNISWAP_V3_QUOTER_ADDRESS: "0x97e7D916aa065eADA70B317677fb8a4A5504F51f",
  },

  ethereum: {
    LIGHTLINK_PORTAL: "0x0000000000000000000000000000000000000000",
  },

  ethereumSepolia: {
    LIGHTLINK_PORTAL: "0x0000000000000000000000000000000000000000",
  },
};

interface Network {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  uniswapv3?: {
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
  rpcUrl:
    process.env.LIGHTLINK_MAINNET_RPC_URL ||
    "https://replicator-01.phoenix.lightlink.io/rpc/v1",
  explorerUrl: "https://phoenix.lightlink.io",
  uniswapv3: {
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
  rpcUrl:
    process.env.LIGHTLINK_TESTNET_RPC_URL ||
    "https://replicator-01.pegasus.lightlink.io/rpc/v1",
  explorerUrl: "https://pegasus.lightlink.io",
  uniswapv3: {
    quoter: CONTRACTS.lightlinkTestnet.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlinkTestnet.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlinkTestnet.UNISWAP_V3_FACTORY_ADDRESS,
  },
  permit2: "0x65b0dE86Df48d72aCdaF7E548b5C836663A0a4fa",
  weth: "0xF42991f02C07AB66cFEa282E7E482382aEB85461",
};

export const Ethereum: Network = {
  id: 1,
  name: "Ethereum",
  rpcUrl:
    process.env.ETHEREUM_MAINNET_RPC_URL ||
    "https://ethereum-rpc.publicnode.com",
  explorerUrl: "https://etherscan.io",
  permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
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
