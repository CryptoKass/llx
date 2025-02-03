// src/elektrik/quote.ts
import {
  decodeFunctionResult,
  encodeFunctionData
} from "viem";

// src/chains.ts
import { createPublicClient, http } from "viem";
import { lightlinkPegasus, lightlinkPhoenix } from "viem/chains";
var CONTRACTS = {
  lightlink: {
    UNIVERSAL_ROUTER: "0x6B3ea22C757BbF9C78CcAaa2eD9562b57001720B",
    UNISWAP_V3_FACTORY_ADDRESS: "0xEE6099234bbdC793a43676D98Eb6B589ca7112D7",
    UNISWAP_V3_QUOTER_ADDRESS: "0x243551e321Dac40508c22de2E00aBECF17F764b5"
  },
  lightlinkTestnet: {
    UNIVERSAL_ROUTER: "0x742d315e929B188e3F05FbC49774474a627b0502",
    UNISWAP_V3_FACTORY_ADDRESS: "0x7A5531FC6628e55f22ED2C6AD015B75948fC36F4",
    UNISWAP_V3_QUOTER_ADDRESS: "0x97e7D916aa065eADA70B317677fb8a4A5504F51f"
  }
};
var Phoenix = {
  id: 1890,
  name: "Lightlink Phoenix",
  rpcUrl: process.env.LIGHTLINK_MAINNET_RPC_URL || "",
  explorerUrl: "https://phoenix.lightlink.io",
  elektrik: {
    quoter: CONTRACTS.lightlink.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlink.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlink.UNISWAP_V3_FACTORY_ADDRESS
  },
  permit2: "0xB952578f3520EE8Ea45b7914994dcf4702cEe578",
  weth: "0x7EbeF2A4b1B09381Ec5B9dF8C5c6f2dBECA59c73"
};
var Pegasus = {
  id: 1891,
  name: "Lightlink Pegasus",
  rpcUrl: process.env.LIGHTLINK_TESTNET_RPC_URL || "",
  explorerUrl: "https://pegasus.lightlink.io",
  elektrik: {
    quoter: CONTRACTS.lightlinkTestnet.UNISWAP_V3_QUOTER_ADDRESS,
    router: CONTRACTS.lightlinkTestnet.UNIVERSAL_ROUTER,
    factory: CONTRACTS.lightlinkTestnet.UNISWAP_V3_FACTORY_ADDRESS
  },
  permit2: "0x65b0dE86Df48d72aCdaF7E548b5C836663A0a4fa",
  weth: "0xF42991f02C07AB66cFEa282E7E482382aEB85461"
};
var getSupportedPublicClient = (id) => {
  if (id != Phoenix.id && id != Pegasus.id) {
    throw new Error("Unsupported chain");
  }
  const chain = id == Phoenix.id ? lightlinkPhoenix : lightlinkPegasus;
  return createPublicClient({
    chain,
    transport: http()
  });
};

// src/elektrik/quote.ts
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
var quoteExactInput = async (chainId, params) => {
  const client = getSupportedPublicClient(chainId);
  const quoterContractAddress = chainId == Phoenix.id ? Phoenix.elektrik.quoter : Pegasus.elektrik.quoter;
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

// src/elektrik/swap.ts
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
    })
  };
}
async function fetchAllowance(chainId, token, owner, spender) {
  const publicClient = getSupportedPublicClient(chainId);
  return await publicClient.readContract({
    address: token,
    abi: TokenABI,
    functionName: "allowance",
    args: [owner, spender]
  });
}
async function ensureAllowance(chainId, token, owner, spender, amount) {
  const txs = [];
  const allowance = await fetchAllowance(chainId, token, owner, spender);
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
function preparePermit2ApprovalTx(chainId, token, target, amount, deadline) {
  const permit2 = chainId == Phoenix.id ? Phoenix.permit2 : Pegasus.permit2;
  return {
    to: permit2,
    data: encodeFunctionData3({
      abi: Permit2ABI,
      functionName: "approve",
      args: [token, target, amount, deadline]
    })
  };
}
async function fetchPermit2Allowance(chainId, owner, token, spender) {
  const publicClient = getSupportedPublicClient(chainId);
  const permit2 = chainId == Phoenix.id ? Phoenix.permit2 : Pegasus.permit2;
  return await publicClient.readContract({
    address: permit2,
    abi: Permit2ABI,
    functionName: "allowance",
    args: [owner, token, spender]
  });
}
var ONE_DAY_IN_SECONDS = 86400;
async function ensurePermit2Allowance(chainId, token, owner, spender, amount) {
  const txs = [];
  const permit2 = chainId == Phoenix.id ? Phoenix.permit2 : Pegasus.permit2;
  txs.push(...await ensureAllowance(chainId, token, owner, permit2, amount));
  const allowance = await fetchPermit2Allowance(chainId, owner, token, spender);
  if (allowance >= amount) {
    return txs;
  }
  const deadline = Math.floor(Date.now() / 1e3) + ONE_DAY_IN_SECONDS;
  txs.push(preparePermit2ApprovalTx(chainId, token, spender, amount, deadline));
  return txs;
}

// src/elektrik/swap.ts
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
var prepareSwapExactInput = async (chainId, sender, params) => {
  if (params.slippage < 0 || params.slippage > 1)
    throw new Error("Slippage must be between 0 and 1");
  const txs = [];
  const universalRouterAddress = chainId == Phoenix.id ? Phoenix.elektrik.router : Pegasus.elektrik.router;
  txs.push(
    ...await ensurePermit2Allowance(
      chainId,
      params.tokenIn,
      sender,
      universalRouterAddress,
      params.amountIn + BigInt(1)
    )
  );
  const slippageBP = BigInt(Math.floor(params.slippage * 1e4));
  const minAmountOut = params.amountOut - params.amountOut * slippageBP / 10000n;
  console.log("minAmountOut", minAmountOut);
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
    data
  });
  return txs;
};

// src/weth/wrap.ts
import "viem/zksync";
var prepareWrapTx = (chainId, amount) => {
  const wethAddress = chainId == Phoenix.id ? Phoenix.weth : Pegasus.weth;
  return {
    to: wethAddress,
    data: "0x",
    value: amount
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
var prepareUnwrapTx = (chainId, amount) => {
  const wethAddress = chainId == Phoenix.id ? Phoenix.weth : Pegasus.weth;
  return {
    to: wethAddress,
    data: encodeFunctionData5({
      abi: WETH_ABI,
      functionName: "withdraw",
      args: [amount]
    })
  };
};

// src/explorer/search.ts
import { lightlinkPegasus as lightlinkPegasus2, lightlinkPhoenix as lightlinkPhoenix2 } from "viem/chains";
var search = async (chainId, query) => {
  if (chainId !== lightlinkPegasus2.id && chainId !== lightlinkPhoenix2.id)
    throw new Error("Unsupported chain");
  const explorer = chainId === lightlinkPegasus2.id ? lightlinkPegasus2.blockExplorers.default.url : lightlinkPhoenix2.blockExplorers.default.url;
  const apiUrl = explorer + "/api/v2/";
  const response = await fetch(apiUrl + "search?q=" + query);
  const data = await response.json();
  return data.items;
};

// src/explorer/contract.ts
import { lightlinkPegasus as lightlinkPegasus3, lightlinkPhoenix as lightlinkPhoenix3 } from "viem/chains";
var getContractInfo = async (chainId, address) => {
  if (chainId !== lightlinkPegasus3.id && chainId !== lightlinkPhoenix3.id)
    throw new Error("Unsupported chain");
  const explorer = chainId === lightlinkPegasus3.id ? lightlinkPegasus3.blockExplorers.default.url : lightlinkPhoenix3.blockExplorers.default.url;
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
var fetchTokenName = async (chainId, address) => {
  const publicClient = getSupportedPublicClient(chainId);
  const name = await publicClient.readContract({
    address,
    abi: TokenABI2,
    functionName: "name"
  });
  return name;
};
var fetchTokenSymbol = async (chainId, address) => {
  const publicClient = getSupportedPublicClient(chainId);
  return await publicClient.readContract({
    address,
    abi: TokenABI2,
    functionName: "symbol"
  });
};
var fetchTokenDecimals = async (chainId, address) => {
  const publicClient = getSupportedPublicClient(chainId);
  return await publicClient.readContract({
    address,
    abi: TokenABI2,
    functionName: "decimals"
  });
};
var fetchTokenTotalSupply = async (chainId, address) => {
  const publicClient = getSupportedPublicClient(chainId);
  return await publicClient.readContract({
    address,
    abi: TokenABI2,
    functionName: "totalSupply"
  });
};
var fetchTokenInfo = async (chainId, address) => {
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    fetchTokenName(chainId, address),
    fetchTokenSymbol(chainId, address),
    fetchTokenDecimals(chainId, address),
    fetchTokenTotalSupply(chainId, address)
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
var fetchBalance = async (chainId, token, account) => {
  const publicClient = getSupportedPublicClient(chainId);
  return await publicClient.readContract({
    address: token,
    abi: TokenABI3,
    functionName: "balanceOf",
    args: [account]
  });
};

// src/index.ts
var elektrik = {
  quoteExactInput,
  swapExactInput: prepareSwapExactInput
};
var weth = {
  prepareWrapTx,
  prepareUnwrapTx
};
export {
  elektrik,
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
  preparePermit2ApprovalTx,
  resolveEnsDomain,
  resolveLLDomain,
  search,
  weth
};
