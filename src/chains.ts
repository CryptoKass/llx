import {
  createPublicClient,
  defineChain,
  http,
  type Address,
  type Chain,
} from "viem";
import {
  lightlinkPegasus,
  lightlinkPhoenix,
  mainnet,
  sepolia,
} from "viem/chains";

const CONTRACTS = {
  lightlink: {
    UNIVERSAL_ROUTER: "0x738fD6d10bCc05c230388B4027CAd37f82fe2AF2",
    UNISWAP_V3_FACTORY_ADDRESS: "0xcb2436774C3e191c85056d248EF4260ce5f27A9D",
    UNISWAP_V3_QUOTER_ADDRESS: "0x5911cB3633e764939edc2d92b7e1ad375Bb57649",
    STANDARD_BRIDGE: "0x4200000000000000000000000000000000000010",
    L2_ERC20_PREDICATE: "0x63105ee97BfB22Dfe23033b3b14A4F8FED121ee9",
  },

  lightlinkTestnet: {
    UNIVERSAL_ROUTER: "0x742d315e929B188e3F05FbC49774474a627b0502",
    UNISWAP_V3_FACTORY_ADDRESS: "0x7A5531FC6628e55f22ED2C6AD015B75948fC36F4",
    UNISWAP_V3_QUOTER_ADDRESS: "0x97e7D916aa065eADA70B317677fb8a4A5504F51f",
    STANDARD_BRIDGE: "0x4200000000000000000000000000000000000010",
    L2_ERC20_PREDICATE: "0xeCBb6206B0bA437EA01080662608b7d445fc7ec",
  },

  ethereum: {
    LIGHTLINK_PORTAL: "0x0000000000000000000000000000000000000000",
    STANDARD_BRIDGE: "0xc7a7199bb5F0aA7B54eca90fC793Ec83E5683b0c",
    L1_ERC20_PREDICATE: "0x63105ee97BfB22Dfe23033b3b14A4F8FED121ee9",
  },

  ethereumSepolia: {
    LIGHTLINK_PORTAL: "0x0000000000000000000000000000000000000000",
    STANDARD_BRIDGE: "0xc7206C8d1F5558a7C899A427bf26AfA377Ad0afA",
    L1_ERC20_PREDICATE: "0x3343DE004FB02522b01FDD2Fd383AEFB9DF77fE7",
  },
};

export interface NetworkDef {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  isL2: boolean;
  uniswapv3?: {
    quoter: string;
    router: string;
    factory: string;
  };
  bridge?: {
    standardBridge?: Address;
    l1ERC20Predicate?: Address;
    l2ERC20Predicate?: Address;
  };
  ens?: { resolver: string };
  permit2: string;
  weth: string;
}

export const Phoenix: NetworkDef = {
  id: 1890,
  name: "Lightlink Phoenix",
  rpcUrl:
    process.env.LIGHTLINK_MAINNET_RPC_URL ||
    "https://replicator-01.phoenix.lightlink.io/rpc/v1",
  explorerUrl: "https://phoenix.lightlink.io",
  isL2: true,
  uniswapv3: {
    quoter: CONTRACTS.lightlink.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlink.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlink.UNISWAP_V3_FACTORY_ADDRESS,
  },
  bridge: {
    standardBridge: CONTRACTS.lightlink.STANDARD_BRIDGE as Address,
    l2ERC20Predicate: CONTRACTS.lightlink.L2_ERC20_PREDICATE as Address,
  },
  permit2: "0xB952578f3520EE8Ea45b7914994dcf4702cEe578",
  weth: "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73",
};

export const Pegasus: NetworkDef = {
  id: 1891,
  name: "Lightlink Pegasus",
  rpcUrl:
    process.env.LIGHTLINK_TESTNET_RPC_URL ||
    "https://replicator-01.pegasus.lightlink.io/rpc/v1",
  explorerUrl: "https://pegasus.lightlink.io",
  isL2: true,
  uniswapv3: {
    quoter: CONTRACTS.lightlinkTestnet.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlinkTestnet.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlinkTestnet.UNISWAP_V3_FACTORY_ADDRESS,
  },
  bridge: {
    standardBridge: CONTRACTS.lightlinkTestnet.STANDARD_BRIDGE as Address,
    l2ERC20Predicate: CONTRACTS.lightlinkTestnet.L2_ERC20_PREDICATE as Address,
  },
  permit2: "0x65b0dE86Df48d72aCdaF7E548b5C836663A0a4fa",
  weth: "0xF42991f02C07AB66cFEa282E7E482382aEB85461",
};

export const Ethereum: NetworkDef = {
  id: 1,
  name: "Ethereum",
  isL2: false,
  rpcUrl:
    process.env.ETHEREUM_MAINNET_RPC_URL ||
    "https://ethereum-rpc.publicnode.com",
  explorerUrl: "https://etherscan.io",
  bridge: {
    standardBridge: CONTRACTS.ethereum.STANDARD_BRIDGE as Address,
    l1ERC20Predicate: CONTRACTS.ethereum.L1_ERC20_PREDICATE as Address,
  },
  permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
};

export const Sepolia: NetworkDef = {
  id: 11155111,
  name: "Ethereum Sepolia",
  isL2: false,
  rpcUrl:
    process.env.ETHEREUM_SEPOLIA_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com",
  explorerUrl: "https://sepolia.etherscan.io",
  bridge: {
    standardBridge: CONTRACTS.ethereumSepolia.STANDARD_BRIDGE as Address,
    l1ERC20Predicate: CONTRACTS.ethereumSepolia.L1_ERC20_PREDICATE as Address,
  },
  permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  weth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
};

export const chains = [Phoenix, Pegasus, Ethereum, Sepolia];

export const getChainById = (id: number) => {
  return chains.find((chain) => chain.id == id);
};

// export const getSupportedPublicClient = (id: number) => {
//   if (id != Phoenix.id && id != Pegasus.id) {
//     throw new Error("Unsupported chain");
//   }

//   const chain = id == Phoenix.id ? lightlinkPhoenix : lightlinkPegasus;

//   return createPublicClient({
//     chain: chain,
//     transport: http(),
//   });
// };

export const getPublicClient = (chainRef: ChainRef) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");

  let viemChain: Chain;
  switch (chain.id) {
    // case Phoenix.id:
    //   viemChain = lightlinkPhoenix;
    //   break;
    // case Pegasus.id:
    //   viemChain = lightlinkPegasus;
    //   break;
    // case Ethereum.id:
    //   viemChain = mainnet;
    //   break;
    // case Sepolia.id:
    //   viemChain = sepolia;
    //   break;
    default:
      viemChain = {
        id: chain.id,
        name: chain.name,
        nativeCurrency: mainnet.nativeCurrency,
        rpcUrls: { default: { http: [chain.rpcUrl] } },
        blockExplorers: {
          default: { name: "explorer", url: chain.explorerUrl },
        },
        testnet: false,
      };
  }

  return createPublicClient({
    chain: viemChain,
    transport: http(),
  });
};

export type ChainRef = number | NetworkDef;

export const resolveChainRef = (ref: ChainRef) => {
  if (typeof ref === "number") {
    return getChainById(ref);
  }

  return ref;
};
