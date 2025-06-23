// src/swap/quote.ts
import {
  decodeFunctionResult,
  encodeFunctionData
} from "viem";

// src/chains.ts
import {
  createPublicClient,
  http
} from "viem";
import {
  mainnet
} from "viem/chains";
var CONTRACTS = {
  lightlink: {
    UNIVERSAL_ROUTER: "0x738fD6d10bCc05c230388B4027CAd37f82fe2AF2",
    UNISWAP_V3_FACTORY_ADDRESS: "0xcb2436774C3e191c85056d248EF4260ce5f27A9D",
    UNISWAP_V3_QUOTER_ADDRESS: "0x5911cB3633e764939edc2d92b7e1ad375Bb57649",
    STANDARD_BRIDGE: "0x4200000000000000000000000000000000000010",
    L2_ERC20_PREDICATE: "0x63105ee97BfB22Dfe23033b3b14A4F8FED121ee9"
  },
  lightlinkTestnet: {
    UNIVERSAL_ROUTER: "0x742d315e929B188e3F05FbC49774474a627b0502",
    UNISWAP_V3_FACTORY_ADDRESS: "0x7A5531FC6628e55f22ED2C6AD015B75948fC36F4",
    UNISWAP_V3_QUOTER_ADDRESS: "0x97e7D916aa065eADA70B317677fb8a4A5504F51f",
    STANDARD_BRIDGE: "0x4200000000000000000000000000000000000010",
    L2_ERC20_PREDICATE: "0xeCBb6206B0bA437EA01080662608b7d445fc7ec"
  },
  ethereum: {
    LIGHTLINK_PORTAL: "0x0000000000000000000000000000000000000000",
    STANDARD_BRIDGE: "0xc7a7199bb5F0aA7B54eca90fC793Ec83E5683b0c",
    L1_ERC20_PREDICATE: "0x63105ee97BfB22Dfe23033b3b14A4F8FED121ee9"
  },
  ethereumSepolia: {
    LIGHTLINK_PORTAL: "0x0000000000000000000000000000000000000000",
    STANDARD_BRIDGE: "0xc7206C8d1F5558a7C899A427bf26AfA377Ad0afA",
    L1_ERC20_PREDICATE: "0x3343DE004FB02522b01FDD2Fd383AEFB9DF77fE7"
  }
};
var Phoenix = {
  id: 1890,
  name: "Lightlink Phoenix",
  rpcUrl: process.env.LIGHTLINK_MAINNET_RPC_URL || "https://replicator-01.phoenix.lightlink.io/rpc/v1",
  explorerUrl: "https://phoenix.lightlink.io",
  isL2: true,
  uniswapv3: {
    quoter: CONTRACTS.lightlink.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlink.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlink.UNISWAP_V3_FACTORY_ADDRESS
  },
  bridge: {
    standardBridge: CONTRACTS.lightlink.STANDARD_BRIDGE,
    l2ERC20Predicate: CONTRACTS.lightlink.L2_ERC20_PREDICATE
  },
  permit2: "0xB952578f3520EE8Ea45b7914994dcf4702cEe578",
  weth: "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73"
};
var Pegasus = {
  id: 1891,
  name: "Lightlink Pegasus",
  rpcUrl: process.env.LIGHTLINK_TESTNET_RPC_URL || "https://replicator-01.pegasus.lightlink.io/rpc/v1",
  explorerUrl: "https://pegasus.lightlink.io",
  isL2: true,
  uniswapv3: {
    quoter: CONTRACTS.lightlinkTestnet.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlinkTestnet.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlinkTestnet.UNISWAP_V3_FACTORY_ADDRESS
  },
  bridge: {
    standardBridge: CONTRACTS.lightlinkTestnet.STANDARD_BRIDGE,
    l2ERC20Predicate: CONTRACTS.lightlinkTestnet.L2_ERC20_PREDICATE
  },
  permit2: "0x65b0dE86Df48d72aCdaF7E548b5C836663A0a4fa",
  weth: "0xF42991f02C07AB66cFEa282E7E482382aEB85461"
};
var Ethereum = {
  id: 1,
  name: "Ethereum",
  isL2: false,
  rpcUrl: process.env.ETHEREUM_MAINNET_RPC_URL || "https://ethereum-rpc.publicnode.com",
  explorerUrl: "https://etherscan.io",
  bridge: {
    standardBridge: CONTRACTS.ethereum.STANDARD_BRIDGE,
    l1ERC20Predicate: CONTRACTS.ethereum.L1_ERC20_PREDICATE
  },
  permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
};
var Sepolia = {
  id: 11155111,
  name: "Ethereum Sepolia",
  isL2: false,
  rpcUrl: process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
  explorerUrl: "https://sepolia.etherscan.io",
  bridge: {
    standardBridge: CONTRACTS.ethereumSepolia.STANDARD_BRIDGE,
    l1ERC20Predicate: CONTRACTS.ethereumSepolia.L1_ERC20_PREDICATE
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
          default: { name: "explorer", url: chain.explorerUrl }
        },
        testnet: false
      };
  }
  return createPublicClient({
    chain: viemChain,
    transport: http()
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
  const encodedData = encodeFunctionData({
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
  const result = decodeFunctionResult({
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
import {
  encodeAbiParameters,
  encodeFunctionData as encodeFunctionData4,
  encodePacked
} from "viem";

// src/token/permit2.ts
import { encodeFunctionData as encodeFunctionData3 } from "viem";

// src/token/approval.ts
import { encodeFunctionData as encodeFunctionData2 } from "viem";
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
    data: encodeFunctionData2({
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
    data: encodeFunctionData3({
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
  const route = encodePacked(
    ["address", "uint24", "address"],
    [params.tokenIn, params.fee, params.tokenOut]
  );
  const inputs = encodeAbiParameters(
    [
      { type: "address" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "bytes" },
      { type: "bool" }
    ],
    [sender, params.amountIn, minAmountOut, route, true]
  );
  const data = encodeFunctionData4({
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
import { encodeFunctionData as encodeFunctionData5 } from "viem";
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
    data: encodeFunctionData5({
      abi: WETH_ABI,
      functionName: "withdraw",
      args: [amount]
    }),
    description: "Unwrapping WETH"
  };
};

// src/explorer/search.ts
import "viem/chains";
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
import "viem/chains";
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
import { createWeb3Name } from "@web3-name-sdk/core";
import { tldNamehash } from "@web3-name-sdk/core/utils";
import { createPublicClient as createPublicClient2, http as http2 } from "viem";
import { lightlinkPhoenix as lightlinkPhoenix4 } from "viem/chains";
import { normalize } from "viem/ens";
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
  const normalizedDomain = normalize(name);
  if (tld === "ll") {
    return resolveLLDomain(normalizedDomain);
  }
  const web3Name = createWeb3Name();
  const address = await web3Name.getAddress(name);
  return address;
};
var LL_IDENTIFIER = 50980310089186268088337308227696701776159000940410532847939554039755637n;
var LL_REGISTRY_ADDRESS = "0x5dC881dDA4e4a8d312be3544AD13118D1a04Cb17";
var resolveLLDomain = async (normalizedDomain) => {
  const nameHash = tldNamehash(normalizedDomain, LL_IDENTIFIER);
  const publicClient = createPublicClient2({
    transport: http2(),
    chain: lightlinkPhoenix4
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
import {
  keccak256,
  encodeAbiParameters as encodeAbiParameters2,
  parseEventLogs
} from "viem";
var prepareStandardBridgeETHDeposit = (chainRef, params) => {
  const txs = [];
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error("Unsupported chain");
  const standardBridgeAddress = params.bridgeAddress ?? chain.bridge?.standardBridge;
  if (!standardBridgeAddress) throw new Error("Standard bridge not found");
  txs.push({
    to: standardBridgeAddress,
    data: "0x",
    value: params.amount,
    description: "Bridge ETH using the standard bridge"
  });
  return txs;
};
var CrossDomainMessengerABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "message",
        type: "bytes"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "messageNonce",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasLimit",
        type: "uint256"
      }
    ],
    name: "SentMessage",
    type: "event"
  }
];
var hasStandardBridgeLogs = (receipt) => {
  const logs = parseEventLogs({
    abi: CrossDomainMessengerABI,
    eventName: "SentMessage",
    logs: receipt.logs
  });
  return logs.length > 0;
};
var extractStandardBridgeTransferID = async (chainRef, txHash) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);
  const client = getPublicClient(chainRef);
  const receipt = await client.getTransactionReceipt({ hash: txHash });
  const logs = parseEventLogs({
    abi: CrossDomainMessengerABI,
    eventName: "SentMessage",
    logs: receipt.logs
  });
  if (logs.length === 0) {
    throw new Error("SentMessage event not found in transaction");
  }
  const sentMessageEvent = logs[0];
  const { target, sender, message, messageNonce, gasLimit } = sentMessageEvent.args;
  const encodedMessage = encodeAbiParameters2(
    [
      { type: "bytes4" },
      // function selector
      { type: "uint256" },
      // nonce
      { type: "address" },
      // sender
      { type: "address" },
      // target
      { type: "uint256" },
      // value (0 for ETH bridges)
      { type: "uint256" },
      // gasLimit
      { type: "bytes" }
      // data
    ],
    [
      "0xd764ad0b",
      // relayMessage function selector
      messageNonce,
      sender,
      target,
      0n,
      // value is 0 for standard ETH bridge
      gasLimit,
      message
    ]
  );
  return keccak256(encodedMessage);
};

// src/bridge/poa.ts
import {
  encodeFunctionData as encodeFunctionData7,
  parseEventLogs as parseEventLogs2,
  keccak256 as keccak2562,
  encodePacked as encodePacked2
} from "viem";
var L1ERC20PredicateABI = [
  {
    name: "deposit",
    inputs: [
      {
        internalType: "address",
        name: "_l1Token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  //   event DepositToken(bytes message);
  {
    name: "DepositToken",
    inputs: [
      {
        internalType: "bytes",
        name: "message",
        type: "bytes"
      }
    ],
    outputs: [],
    type: "event"
  }
];
var L2ERC20PredicateABI = [
  {
    name: "withdraw",
    inputs: [
      {
        internalType: "address",
        name: "_l2Token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  //   event WithdrawToken(bytes message);
  {
    name: "WithdrawToken",
    inputs: [
      {
        internalType: "bytes",
        name: "message",
        type: "bytes"
      }
    ],
    outputs: [],
    type: "event"
  }
];
var preparePoaBridgeToL2 = async (chainRef, sender, params) => {
  const { amount, token } = params;
  if (token === "eth") throw new Error("ETH is not supported for POA bridge");
  if (!token) throw new Error("Token is required");
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);
  const l1ERC20Predicate = params.bridgeAddress ?? chain.bridge?.l1ERC20Predicate;
  if (!l1ERC20Predicate) throw new Error(`L1 ERC20 Predicate not found`);
  const allowanceTxs = await ensureAllowance(
    chainRef,
    token,
    l1ERC20Predicate,
    sender,
    amount
  );
  const depositeData = encodeFunctionData7({
    abi: L1ERC20PredicateABI,
    functionName: "deposit",
    args: [token, amount]
  });
  return [
    ...allowanceTxs,
    {
      to: l1ERC20Predicate,
      data: depositeData,
      value: amount,
      description: "Bridge to L2 using POA bridge"
    }
  ];
};
var preparePoaBridgeToL1 = async (chainRef, sender, params) => {
  const { amount, token } = params;
  if (token === "eth") throw new Error("ETH is not supported for POA bridge");
  if (!token) throw new Error("Token is required");
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);
  const l2ERC20Predicate = params.bridgeAddress ?? chain.bridge?.l2ERC20Predicate;
  if (!l2ERC20Predicate) throw new Error(`L2 ERC20 Predicate not found`);
  const allowanceTxs = await ensureAllowance(
    chainRef,
    token,
    l2ERC20Predicate,
    sender,
    amount
  );
  const withdrawData = encodeFunctionData7({
    abi: L2ERC20PredicateABI,
    functionName: "withdraw",
    args: [token, amount]
  });
  return [
    ...allowanceTxs,
    {
      to: l2ERC20Predicate,
      data: withdrawData,
      description: "Bridge to L1 using POA bridge"
    }
  ];
};
var preparePoaBridgeDeposit = async (chainRef, sender, params) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);
  if (chain.isL2) return preparePoaBridgeToL2(chainRef, sender, params);
  return preparePoaBridgeToL1(chainRef, sender, params);
};
var hasPoaBridgeLogs = (receipt) => {
  const l1Logs = parseEventLogs2({
    abi: L1ERC20PredicateABI,
    logs: receipt.logs
  });
  if (l1Logs.length > 0) return true;
  const l2Logs = parseEventLogs2({
    abi: L2ERC20PredicateABI,
    logs: receipt.logs
  });
  return l2Logs.length > 0;
};
var extractPoaBridgeToL2TransferID = async (chainRef, txHash) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);
  const publicClient = getPublicClient(chainRef);
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (!receipt) throw new Error(`Transaction ${txHash} not found`);
  const logs = parseEventLogs2({
    abi: L1ERC20PredicateABI,
    logs: receipt.logs
  });
  const depositEvent = logs.find((log) => log.eventName === "DepositToken");
  if (!depositEvent)
    throw new Error("DepositToken event not found in transaction logs");
  const message = depositEvent.args.message;
  const chainId = BigInt(chain.id);
  const packed = encodePacked2(["uint256", "bytes"], [chainId, message]);
  return keccak2562(packed);
};
var extractPoaBridgeToL1TransferID = async (chainRef, txHash) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);
  const publicClient = getPublicClient(chainRef);
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (!receipt) throw new Error(`Transaction ${txHash} not found`);
  const logs = parseEventLogs2({
    abi: L2ERC20PredicateABI,
    logs: receipt.logs
  });
  const withdrawEvent = logs.find((log) => log.eventName === "WithdrawToken");
  if (!withdrawEvent)
    throw new Error("WithdrawToken event not found in transaction logs");
  const message = withdrawEvent.args.message;
  const chainId = BigInt(chain.id);
  const packed = encodePacked2(["uint256", "bytes"], [chainId, message]);
  return keccak2562(packed);
};

// src/bridge/bridge.ts
var prepareBridgeTransfer = (chainRef, sender, params) => {
  if (params.token === "eth") {
    return prepareStandardBridgeETHDeposit(chainRef, params);
  }
  return preparePoaBridgeDeposit(chainRef, sender, params);
};
var extractBridgeTransferID = async (chainRef, txHash) => {
  const chain = resolveChainRef(chainRef);
  if (!chain) throw new Error(`Chain ${chainRef} not found`);
  const publicClient = getPublicClient(chainRef);
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (!receipt) throw new Error(`Transaction ${txHash} not found`);
  if (hasPoaBridgeLogs(receipt)) {
    if (chain.isL2)
      return await extractPoaBridgeToL2TransferID(chainRef, txHash);
    return await extractPoaBridgeToL1TransferID(chainRef, txHash);
  }
  if (hasStandardBridgeLogs(receipt))
    return await extractStandardBridgeTransferID(chainRef, txHash);
  throw new Error("No bridge logs found");
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
export {
  ensureAllowance,
  ensurePermit2Allowance,
  extractBridgeTransferID,
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
};
//# sourceMappingURL=index.js.map