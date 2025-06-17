"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ensureAllowance: () => ensureAllowance,
  ensurePermit2Allowance: () => ensurePermit2Allowance,
  fetchAllowance: () => fetchAllowance,
  fetchBalance: () => fetchBalance,
  fetchPermit2Allowance: () => fetchPermit2Allowance,
  fetchTokenDecimals: () => fetchTokenDecimals,
  fetchTokenInfo: () => fetchTokenInfo,
  fetchTokenName: () => fetchTokenName,
  fetchTokenSymbol: () => fetchTokenSymbol,
  fetchTokenTotalSupply: () => fetchTokenTotalSupply,
  getContractInfo: () => getContractInfo,
  prepareApprovalTx: () => prepareApprovalTx,
  prepareBridgeTransfer: () => prepareBridgeTransfer,
  preparePermit2ApprovalTx: () => preparePermit2ApprovalTx,
  resolveEnsDomain: () => resolveEnsDomain,
  resolveLLDomain: () => resolveLLDomain,
  search: () => search,
  swap: () => swap,
  weth: () => weth
});
module.exports = __toCommonJS(index_exports);

// src/swap/quote.ts
var import_viem2 = require("viem");

// src/chains.ts
var import_viem = require("viem");
var import_chains = require("viem/chains");
var CONTRACTS = {
  lightlink: {
    UNIVERSAL_ROUTER: "0x738fD6d10bCc05c230388B4027CAd37f82fe2AF2",
    UNISWAP_V3_FACTORY_ADDRESS: "0xcb2436774C3e191c85056d248EF4260ce5f27A9D",
    UNISWAP_V3_QUOTER_ADDRESS: "0x5911cB3633e764939edc2d92b7e1ad375Bb57649",
    STANDARD_BRIDGE: "0x4200000000000000000000000000000000000010"
  },
  lightlinkTestnet: {
    UNIVERSAL_ROUTER: "0x742d315e929B188e3F05FbC49774474a627b0502",
    UNISWAP_V3_FACTORY_ADDRESS: "0x7A5531FC6628e55f22ED2C6AD015B75948fC36F4",
    UNISWAP_V3_QUOTER_ADDRESS: "0x97e7D916aa065eADA70B317677fb8a4A5504F51f",
    STANDARD_BRIDGE: "0x4200000000000000000000000000000000000010"
  },
  ethereum: {
    LIGHTLINK_PORTAL: "0x0000000000000000000000000000000000000000",
    STANDARD_BRIDGE: "0xc7a7199bb5F0aA7B54eca90fC793Ec83E5683b0c"
  },
  ethereumSepolia: {
    LIGHTLINK_PORTAL: "0x0000000000000000000000000000000000000000",
    STANDARD_BRIDGE: "0xc7206C8d1F5558a7C899A427bf26AfA377Ad0afA"
  }
};
var Phoenix = {
  id: 1890,
  name: "Lightlink Phoenix",
  rpcUrl: process.env.LIGHTLINK_MAINNET_RPC_URL || "https://replicator-01.phoenix.lightlink.io/rpc/v1",
  explorerUrl: "https://phoenix.lightlink.io",
  uniswapv3: {
    quoter: CONTRACTS.lightlink.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlink.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlink.UNISWAP_V3_FACTORY_ADDRESS
  },
  bridge: {
    standardBridge: CONTRACTS.lightlink.STANDARD_BRIDGE
  },
  permit2: "0xB952578f3520EE8Ea45b7914994dcf4702cEe578",
  weth: "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73"
};
var Pegasus = {
  id: 1891,
  name: "Lightlink Pegasus",
  rpcUrl: process.env.LIGHTLINK_TESTNET_RPC_URL || "https://replicator-01.pegasus.lightlink.io/rpc/v1",
  explorerUrl: "https://pegasus.lightlink.io",
  uniswapv3: {
    quoter: CONTRACTS.lightlinkTestnet.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlinkTestnet.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlinkTestnet.UNISWAP_V3_FACTORY_ADDRESS
  },
  bridge: {
    standardBridge: CONTRACTS.lightlinkTestnet.STANDARD_BRIDGE
  },
  permit2: "0x65b0dE86Df48d72aCdaF7E548b5C836663A0a4fa",
  weth: "0xF42991f02C07AB66cFEa282E7E482382aEB85461"
};
var Ethereum = {
  id: 1,
  name: "Ethereum",
  rpcUrl: process.env.ETHEREUM_MAINNET_RPC_URL || "https://ethereum-rpc.publicnode.com",
  explorerUrl: "https://etherscan.io",
  bridge: {
    standardBridge: CONTRACTS.ethereum.STANDARD_BRIDGE
  },
  permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
};
var Sepolia = {
  id: 11155111,
  name: "Ethereum Sepolia",
  rpcUrl: process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
  explorerUrl: "https://sepolia.etherscan.io",
  bridge: {
    standardBridge: CONTRACTS.ethereumSepolia.STANDARD_BRIDGE
  },
  permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  weth: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"
};
var chains = [Phoenix, Pegasus, Ethereum, Sepolia];
var getChainById = (id) => {
  return chains.find((chain) => chain.id == id);
};
var getPublicClient = (chainRef) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  let viemChain;
  switch (chain.id) {
    case Phoenix.id:
      viemChain = import_chains.lightlinkPhoenix;
      break;
    case Pegasus.id:
      viemChain = import_chains.lightlinkPegasus;
      break;
    case Ethereum.id:
      viemChain = import_chains.mainnet;
      break;
    case Sepolia.id:
      viemChain = import_chains.sepolia;
      break;
    default:
      viemChain = {
        id: chain.id,
        name: chain.name,
        nativeCurrency: import_chains.mainnet.nativeCurrency,
        rpcUrls: { default: { http: [chain.rpcUrl] } },
        blockExplorers: {
          default: { name: "explorer", url: chain.explorerUrl }
        },
        testnet: false
      };
  }
  return (0, import_viem.createPublicClient)({
    chain: viemChain,
    transport: (0, import_viem.http)()
  });
};
var resolveChainRef = (ref) => {
  if (typeof ref === "number") {
    return getChainById(ref);
  }
  return ref;
};

// src/swap/quote.ts
var QuoterABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          { internalType: "uint24", name: "fee", type: "uint24" },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160"
          }
        ],
        internalType: "struct IQuoterV2.QuoteExactInputSingleParams",
        name: "params",
        type: "tuple"
      }
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      {
        internalType: "uint160",
        name: "sqrtPriceX96After",
        type: "uint160"
      },
      {
        internalType: "uint32",
        name: "initializedTicksCrossed",
        type: "uint32"
      },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
];
var quoteExactInput = async (chainRef, params) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  if (!chain.uniswapv3) throw new Error("Uniswap V3 not supported");
  const client = getPublicClient(chainRef);
  const quoterContractAddress = chain.uniswapv3.quoter;
  return _quoteExactInput(client, quoterContractAddress, params);
};
var _quoteExactInput = async (client, quoterContractAddress, params) => {
  const { fromToken, toToken, amountIn, fee } = params;
  const encodedData = (0, import_viem2.encodeFunctionData)({
    abi: QuoterABI,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: fromToken,
        tokenOut: toToken,
        amountIn,
        fee,
        sqrtPriceLimitX96: 0n
        // no limit
      }
    ]
  });
  const response = await client.call({
    to: quoterContractAddress,
    data: encodedData
  });
  const result = (0, import_viem2.decodeFunctionResult)({
    abi: QuoterABI,
    functionName: "quoteExactInputSingle",
    data: response.data
  });
  const quotedAmountOut = result[0];
  const sqrtPriceX96After = result[1];
  const initializedTicksCrossed = result[2];
  const gasEstimate = result[3];
  return {
    amountOut: quotedAmountOut,
    sqrtPriceX96After,
    initializedTicksCrossed,
    gasEstimate
  };
};

// src/swap/swap.ts
var import_viem5 = require("viem");

// src/token/permit2.ts
var import_viem4 = require("viem");

// src/token/approval.ts
var import_viem3 = require("viem");
var TokenABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool", name: "success" }],
    stateMutability: "nonpayable"
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" }
    ],
    outputs: [{ type: "uint256", name: "allowance" }],
    stateMutability: "view"
  }
];
function prepareApprovalTx(token, target, amount) {
  return {
    to: token,
    data: (0, import_viem3.encodeFunctionData)({
      abi: TokenABI,
      functionName: "approve",
      args: [target, amount]
    }),
    description: "Approving token to be spent by target"
  };
}
async function fetchAllowance(chainRef, token, owner, spender) {
  const publicClient = getPublicClient(chainRef);
  return await publicClient.readContract({
    address: token,
    abi: TokenABI,
    functionName: "allowance",
    args: [owner, spender]
  });
}
async function ensureAllowance(chainRef, token, owner, spender, amount) {
  const txs = [];
  const allowance = await fetchAllowance(chainRef, token, owner, spender);
  if (allowance < amount) {
    txs.push(prepareApprovalTx(token, spender, amount));
  }
  return txs;
}

// src/token/permit2.ts
var Permit2ABI = [
  {
    name: "allowance",
    type: "function",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "token" },
      { type: "address", name: "spender" }
    ],
    outputs: [{ type: "uint256", name: "allowance" }],
    stateMutability: "view"
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint160", name: "amount", type: "uint160" },
      { internalType: "uint48", name: "expiration", type: "uint48" }
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];
function preparePermit2ApprovalTx(chainRef, token, target, amount, deadline) {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  if (!chain.permit2) throw new Error("Permit2 not supported");
  const permit2 = chain.permit2;
  return {
    to: permit2,
    data: (0, import_viem4.encodeFunctionData)({
      abi: Permit2ABI,
      functionName: "approve",
      args: [token, target, amount, deadline]
    }),
    description: "Using Permit2 to approve the target to spend the token"
  };
}
async function fetchPermit2Allowance(chainRef, owner, token, spender) {
  const publicClient = getPublicClient(chainRef);
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  const permit2 = chain.permit2;
  return await publicClient.readContract({
    address: permit2,
    abi: Permit2ABI,
    functionName: "allowance",
    args: [owner, token, spender]
  });
}
var ONE_DAY_IN_SECONDS = 86400;
async function ensurePermit2Allowance(chainRef, token, owner, spender, amount) {
  const txs = [];
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  if (!chain.permit2) throw new Error("Permit2 not supported");
  const permit2 = chain.permit2;
  txs.push(...await ensureAllowance(chainRef, token, owner, permit2, amount));
  const allowance = await fetchPermit2Allowance(
    chainRef,
    owner,
    token,
    spender
  );
  if (allowance >= amount) {
    return txs;
  }
  const deadline = Math.floor(Date.now() / 1e3) + ONE_DAY_IN_SECONDS;
  txs.push(
    preparePermit2ApprovalTx(chainRef, token, spender, amount, deadline)
  );
  return txs;
}

// src/swap/swap.ts
var SWAP_EXACT_IN = "0x00";
var UniversalRouterABI = [
  {
    inputs: [
      { internalType: "bytes", name: "commands", type: "bytes" },
      { internalType: "bytes[]", name: "inputs", type: "bytes[]" }
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
];
var prepareSwapExactInput = async (chainRef, sender, params) => {
  if (params.slippage < 0 || params.slippage > 1)
    throw new Error("Slippage must be between 0 and 1");
  const txs = [];
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  if (!chain.uniswapv3) throw new Error("Uniswap V3 not supported");
  const universalRouterAddress = chain.uniswapv3.router;
  txs.push(
    ...await ensurePermit2Allowance(
      chain.id,
      params.tokenIn,
      sender,
      universalRouterAddress,
      params.amountIn + BigInt(1)
    )
  );
  const slippageBP = BigInt(Math.floor(params.slippage * 1e4));
  const minAmountOut = params.amountOut - params.amountOut * slippageBP / 10000n;
  const route = (0, import_viem5.encodePacked)(
    ["address", "uint24", "address"],
    [params.tokenIn, params.fee, params.tokenOut]
  );
  const inputs = (0, import_viem5.encodeAbiParameters)(
    [
      { type: "address" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "bytes" },
      { type: "bool" }
    ],
    [sender, params.amountIn, minAmountOut, route, true]
  );
  const data = (0, import_viem5.encodeFunctionData)({
    functionName: "execute",
    abi: UniversalRouterABI,
    args: [SWAP_EXACT_IN, [inputs]]
  });
  txs.push({
    to: universalRouterAddress,
    data,
    description: "Executing swap via Universal Router"
  });
  return txs;
};

// src/weth/wrap.ts
var prepareWrapTx = (chainRef, amount) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  if (!chain.weth) throw new Error("WETH not supported");
  const wethAddress = chain.weth;
  return {
    to: wethAddress,
    data: "0x",
    value: amount,
    description: "Wrapping ETH"
  };
};

// src/weth/unwrap.ts
var import_viem6 = require("viem");
var WETH_ABI = [
  // function withdraw(uint wad) public
  {
    name: "withdraw",
    inputs: [{ name: "wad", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];
var prepareUnwrapTx = (chainRef, amount) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  if (!chain.weth) throw new Error("WETH not supported");
  const wethAddress = chain.weth;
  return {
    to: wethAddress,
    data: (0, import_viem6.encodeFunctionData)({
      abi: WETH_ABI,
      functionName: "withdraw",
      args: [amount]
    }),
    description: "Unwrapping WETH"
  };
};

// src/explorer/search.ts
var import_chains8 = require("viem/chains");
var search = async (chainRef, query) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  const explorer = chain.explorerUrl;
  const apiUrl = explorer + "/api/v2/";
  const response = await fetch(apiUrl + "search?q=" + query);
  const data = await response.json();
  return data.items;
};

// src/explorer/contract.ts
var import_chains10 = require("viem/chains");
var getContractInfo = async (chainRef, address) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  const explorer = chain.explorerUrl;
  const apiUrl = explorer + "/api/v2/";
  const response = await fetch(apiUrl + "smart-contracts/" + address);
  const data = await response.json();
  return data;
};

// src/ens.ts
var import_core = require("@web3-name-sdk/core");
var import_utils = require("@web3-name-sdk/core/utils");
var import_viem7 = require("viem");
var import_chains12 = require("viem/chains");
var import_ens = require("viem/ens");
var ENSRegistryABI = [
  {
    name: "resolver",
    type: "function",
    inputs: [{ type: "bytes32", name: "node" }],
    outputs: [{ type: "address", name: "resolver" }],
    stateMutability: "view"
  }
];
var ENSResolverABI = [
  {
    name: "addr",
    type: "function",
    inputs: [{ type: "bytes32", name: "node" }],
    outputs: [{ type: "address", name: "addr" }],
    stateMutability: "view"
  }
];
var resolveEnsDomain = async (name) => {
  const tld = name.split(".").pop();
  const normalizedDomain = (0, import_ens.normalize)(name);
  if (tld === "ll") {
    return resolveLLDomain(normalizedDomain);
  }
  const web3Name = (0, import_core.createWeb3Name)();
  const address = await web3Name.getAddress(name);
  return address;
};
var LL_IDENTIFIER = 50980310089186268088337308227696701776159000940410532847939554039755637n;
var LL_REGISTRY_ADDRESS = "0x5dC881dDA4e4a8d312be3544AD13118D1a04Cb17";
var resolveLLDomain = async (normalizedDomain) => {
  const nameHash = (0, import_utils.tldNamehash)(normalizedDomain, LL_IDENTIFIER);
  const publicClient = (0, import_viem7.createPublicClient)({
    transport: (0, import_viem7.http)(),
    chain: import_chains12.lightlinkPhoenix
  });
  const resolver = await publicClient.readContract({
    address: LL_REGISTRY_ADDRESS,
    abi: ENSRegistryABI,
    functionName: "resolver",
    args: [nameHash]
  });
  const address = await publicClient.readContract({
    address: resolver,
    abi: ENSResolverABI,
    functionName: "addr",
    args: [nameHash]
  });
  return address;
};

// src/token/info.ts
var TokenABI2 = [
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }]
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  }
];
var fetchTokenName = async (chainRef, address) => {
  const publicClient = getPublicClient(chainRef);
  const name = await publicClient.readContract({
    address,
    abi: TokenABI2,
    functionName: "name"
  });
  return name;
};
var fetchTokenSymbol = async (chainRef, address) => {
  const publicClient = getPublicClient(chainRef);
  return await publicClient.readContract({
    address,
    abi: TokenABI2,
    functionName: "symbol"
  });
};
var fetchTokenDecimals = async (chainRef, address) => {
  const publicClient = getPublicClient(chainRef);
  return await publicClient.readContract({
    address,
    abi: TokenABI2,
    functionName: "decimals"
  });
};
var fetchTokenTotalSupply = async (chainRef, address) => {
  const publicClient = getPublicClient(chainRef);
  return await publicClient.readContract({
    address,
    abi: TokenABI2,
    functionName: "totalSupply"
  });
};
var fetchTokenInfo = async (chainRef, address) => {
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    fetchTokenName(chainRef, address),
    fetchTokenSymbol(chainRef, address),
    fetchTokenDecimals(chainRef, address),
    fetchTokenTotalSupply(chainRef, address)
  ]);
  return { name, symbol, decimals, totalSupply };
};

// src/token/balance.ts
var TokenABI3 = [
  {
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
    stateMutability: "view"
  }
];
var fetchBalance = async (chainRef, token, account) => {
  const publicClient = getPublicClient(chainRef);
  return await publicClient.readContract({
    address: token,
    abi: TokenABI3,
    functionName: "balanceOf",
    args: [account]
  });
};

// src/bridge/standard.ts
var import_viem8 = require("viem");
var StandardBridgeABI = [
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_minGasLimit",
        type: "uint32"
      },
      {
        internalType: "bytes",
        name: "_extraData",
        type: "bytes"
      }
    ],
    name: "bridgeETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
];
var prepareStandardBridgeETHDeposit = (chainRef, params) => {
  const txs = [];
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  const standardBridgeAddress = params.bridgeAddress ?? chain.bridge?.standardBridge;
  if (!standardBridgeAddress) throw new Error("Standard bridge not found");
  const encodedData = (0, import_viem8.encodeFunctionData)({
    abi: StandardBridgeABI,
    functionName: "bridgeETH",
    args: [params.minGasLimit ?? 3e4, "0x"]
  });
  txs.push({
    to: standardBridgeAddress,
    data: encodedData,
    value: params.amount,
    description: "Bridge ETH"
  });
  return txs;
};

// src/bridge/bridge.ts
var prepareBridgeTransfer = (chainRef, params) => {
  if (params.token === "eth") {
    return prepareStandardBridgeETHDeposit(chainRef, params);
  }
  throw new Error("Unsupported asset");
};

// src/index.ts
var swap = {
  quoteExactInput,
  swapExactInput: prepareSwapExactInput
};
var weth = {
  prepareWrapTx,
  prepareUnwrapTx
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ensureAllowance,
  ensurePermit2Allowance,
  fetchAllowance,
  fetchBalance,
  fetchPermit2Allowance,
  fetchTokenDecimals,
  fetchTokenInfo,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
  getContractInfo,
  prepareApprovalTx,
  prepareBridgeTransfer,
  preparePermit2ApprovalTx,
  resolveEnsDomain,
  resolveLLDomain,
  search,
  swap,
  weth
});
//# sourceMappingURL=index.cjs.map