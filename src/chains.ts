import { defineChain } from "viem";

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

export const lightlinkPhoenix = defineChain({
  id: 1890,
  name: "Lightlink Phoenix",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.LIGHTLINK_MAINNET_RPC_URL ||
          "https://replicator-01.phoenix.lightlink.io/rpc/v1",
      ],
      webSocket: [
        process.env.LIGHTLINK_MAINNET_RPC_URL ||
          "wss://replicator-01.phoenix.lightlink.io/rpc/v1",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://phoenix.lightlink.io" },
  },
  contracts: {
    uniswapV3Factory: {
      address: CONTRACTS.lightlink.UNISWAP_V3_FACTORY_ADDRESS,
    },
    universalRouter: {
      address: CONTRACTS.lightlink.UNIVERSAL_ROUTER,
    },
    uniswapV3Quoter: {
      address: CONTRACTS.lightlink.UNISWAP_V3_QUOTER_ADDRESS,
    },
  },
});

export const lightlinkPegasus = defineChain({
  id: 1891,
  name: "Lightlink Pegasus Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.LIGHTLINK_TESTNET_RPC_URL ||
          "https://replicator-01.pegasus.lightlink.io/rpc/v1",
      ],
      webSocket: [
        process.env.LIGHTLINK_TESTNET_RPC_URL ||
          "wss://replicator-01.pegasus.lightlink.io/rpc/v1",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://pegasus.lightlink.io" },
  },
  contracts: {
    uniswapV3Factory: {
      address: CONTRACTS.lightlinkTestnet.UNISWAP_V3_FACTORY_ADDRESS,
    },
    universalRouter: {
      address: CONTRACTS.lightlinkTestnet.UNIVERSAL_ROUTER,
    },
    uniswapV3Quoter: {
      address: CONTRACTS.lightlinkTestnet.UNISWAP_V3_QUOTER_ADDRESS,
    },
  },
});
