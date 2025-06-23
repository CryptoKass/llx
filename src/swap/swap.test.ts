import { describe, expect, test, beforeAll, afterAll } from "vitest";
import { createAnvil, type Anvil } from "@viem/anvil";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  type WalletClient,
  type PublicClient,
  type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Phoenix, type NetworkDef } from "../chains.js";
import { prepareWrapTx } from "../weth/wrap.js";
import { quoteExactInput } from "./quote.js";
import { prepareSwapExactInput } from "./swap.js";

const generateFakePrivateKey = (): `0x${string}` => {
  let key = "";
  const hex = "0123456789abcdef";
  for (let i = 0; i < 64; i++) {
    key += hex[Math.floor(Math.random() * hex.length)];
  }
  return ("0x" + key) as `0x${string}`;
};

interface ForkedNetwork {
  anvil: Anvil;
  networkDef: NetworkDef;
  chainDef: Chain;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

const setupForkedNetwork = async (
  baseNetwork: NetworkDef,
  port: number
): Promise<ForkedNetwork> => {
  const anvil = createAnvil({
    autoImpersonate: true,
    forkUrl: baseNetwork.rpcUrl,
    port,
  });
  await anvil.start();

  const anvilDef: NetworkDef = {
    ...baseNetwork,
    name: "Anvil Fork: " + baseNetwork.name,
    rpcUrl: `http://127.0.0.1:${anvil.port}`,
  };

  const anvilChain: Chain = {
    id: baseNetwork.id,
    name: "Anvil Fork: " + baseNetwork.name,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [`http://127.0.0.1:${anvil.port}`] },
    },
    blockExplorers: {
      default: { name: "explorer", url: baseNetwork.explorerUrl },
    },
    testnet: false,
  };

  const anvilPublicClient = createPublicClient({
    chain: anvilChain,
    transport: http(),
  });

  const anvilWalletClient = createWalletClient({
    account: TEST_ACCOUNT,
    chain: anvilChain,
    transport: http(),
  });

  // Set balance for test account using anvil (10,000 ETH)
  const res = await fetch(`http://127.0.0.1:${anvil.port}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "anvil_setBalance",
      params: [TEST_ACCOUNT.address, "0x021e19e0c9bab2400000"], // 10,000 ETH in wei
    }),
  });

  const resData = (await res.json()) as { error?: any; result?: any };
  if (!res.ok || resData.error) {
    throw new Error(`Failed to set balance: ${JSON.stringify(resData)}`);
  }
  console.log(`Balance set successfully:`, resData);

  return {
    anvil,
    networkDef: anvilDef,
    chainDef: anvilChain,
    publicClient: anvilPublicClient,
    walletClient: anvilWalletClient,
  };
};

// Test configuration
let TEST_PRIVATE_KEY: `0x${string}` = generateFakePrivateKey();
let TEST_ACCOUNT = privateKeyToAccount(TEST_PRIVATE_KEY);

// Token addresses
const WETH_ADDRESS = "0x7ebef2a4b1b09381ec5b9df8c5c6f2dbeca59c73" as const;
const LL_ADDRESS = "0xd9d7123552fa2bedb2348bb562576d67f6e8e96e" as const;

describe("Swap", () => {
  let phoenixFork: ForkedNetwork;

  beforeAll(async () => {
    phoenixFork = await setupForkedNetwork(Phoenix, 8545);
  });

  afterAll(async () => {
    if (phoenixFork) await phoenixFork.anvil.stop();
  });

  test("network is setup correctly", async () => {
    const balance = await phoenixFork.publicClient.getBalance({
      address: TEST_ACCOUNT.address,
    });
    expect(balance).toBe(parseEther("10000")); // 10,000 ETH
  });

  test("should wrap ETH to WETH", async () => {
    const wrapAmount = parseEther("1");

    const wrapTx = prepareWrapTx(phoenixFork.networkDef, wrapAmount);

    expect(wrapTx.to?.toLowerCase()).toBe(WETH_ADDRESS.toLowerCase());
    expect(wrapTx.value).toBe(wrapAmount);
    expect(wrapTx.description).toBe("Wrapping ETH");

    const txHash = await phoenixFork.walletClient.sendTransaction({
      to: wrapTx.to!,
      value: wrapTx.value!,
      data: wrapTx.data!,
      chain: phoenixFork.chainDef,
      account: TEST_ACCOUNT,
    });

    expect(txHash).toBeDefined();
    await phoenixFork.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // Verify WETH balance
    const wethBalance = await phoenixFork.publicClient.readContract({
      address: WETH_ADDRESS,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "", type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [TEST_ACCOUNT.address],
    });

    expect(wethBalance).toBe(wrapAmount);
  });

  test("should get quote for WETH to LL swap", async () => {
    const swapAmount = parseEther("0.1");
    const fee = 3000; // 0.1% fee tier

    const quote = await quoteExactInput(phoenixFork.networkDef, {
      fromToken: WETH_ADDRESS,
      toToken: LL_ADDRESS,
      amountIn: swapAmount,
      fee,
    });

    expect(quote.amountOut).toBeGreaterThan(0n);
    expect(quote.gasEstimate).toBeGreaterThan(0n);
    console.log(`Quote: ${swapAmount} WETH -> ${quote.amountOut} LL`);
  });

  test("should swap WETH to LL", async () => {
    const swapAmount = parseEther("0.1");
    const fee = 3000; // 0.3% fee tier
    const slippage = 0.3; // 30% slippage

    // First get a quote
    const quote = await quoteExactInput(phoenixFork.networkDef, {
      fromToken: WETH_ADDRESS,
      toToken: LL_ADDRESS,
      amountIn: swapAmount,
      fee,
    });

    // Prepare swap transaction
    const swapTxs = await prepareSwapExactInput(
      phoenixFork.networkDef,
      TEST_ACCOUNT.address,
      {
        tokenIn: WETH_ADDRESS,
        tokenOut: LL_ADDRESS,
        amountIn: swapAmount,
        amountOut: quote.amountOut,
        fee,
        slippage,
      }
    );

    expect(swapTxs.length).toBeGreaterThan(0);

    // Get initial LL balance
    const initialLLBalance = await phoenixFork.publicClient.readContract({
      address: LL_ADDRESS,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "", type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [TEST_ACCOUNT.address],
    });

    // Execute all transactions
    for (const tx of swapTxs) {
      console.log(`Sending tx: ${tx.description}`);
      const txHash = await phoenixFork.walletClient.sendTransaction({
        to: tx.to!,
        value: tx.value || 0n,
        data: tx.data!,
        chain: phoenixFork.chainDef,
        account: TEST_ACCOUNT,
      });

      expect(txHash).toBeDefined();
      await phoenixFork.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      console.log(`Executed: ${tx.description}`);
    }

    // Check final LL balance
    const finalLLBalance = await phoenixFork.publicClient.readContract({
      address: LL_ADDRESS,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "", type: "uint256" }],
        },
      ],
      functionName: "balanceOf",
      args: [TEST_ACCOUNT.address],
    });

    const llReceived = finalLLBalance - initialLLBalance;
    expect(llReceived).toBeGreaterThan(0n);

    console.log(`Swap completed: received ${llReceived} LL tokens`);
  });
}, 30_000);
