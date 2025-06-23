import { describe, expect, test, beforeAll, afterAll } from "vitest";
import { createAnvil, type Anvil } from "@viem/anvil";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  getAddress,
  type Address,
  type WalletClient,
  type PublicClient,
  parseEventLogs,
  type Chain,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  prepareStandardBridgeETHDeposit,
  hasStandardBridgeLogs,
  extractStandardBridgeTransferID,
} from "./standard.js";
import { Ethereum, type ChainRef, type NetworkDef } from "../chains.js";
import { mainnet } from "viem/chains";
import { waitForTransactionReceipt } from "viem/actions";

const generateFakePrivateKey = (): `0x${string}` => {
  let key = "";
  const hex = "0123456789abcdef";
  for (let i = 0; i < 64; i++) {
    key += hex[Math.floor(Math.random() * hex.length)];
  }
  return ("0x" + key) as `0x${string}`;
};

// Test configuration
let TEST_PRIVATE_KEY: `0x${string}` = generateFakePrivateKey();
let TEST_ACCOUNT = privateKeyToAccount(TEST_PRIVATE_KEY);
const TEST_BRIDGE_ADDRESS = Ethereum.bridge?.standardBridge;

describe("Standard Bridge", () => {
  let l1PublicClient: PublicClient;
  let l1Anvil: Anvil;
  let l1WalletClient: WalletClient;
  let l1ForkedNetwork: NetworkDef;
  let l1AnvilChain: Chain;

  beforeAll(async () => {
    // Create anvil instance forking Ethereum mainnet
    l1Anvil = createAnvil({
      autoImpersonate: true,
      forkUrl:
        process.env.ETHEREUM_MAINNET_RPC_URL ||
        "https://ethereum-rpc.publicnode.com",
    });
    await l1Anvil.start();

    l1AnvilChain = {
      ...mainnet,
      name: "Anvil Forked Ethereum",
      nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: { http: [`http://127.0.0.1:${l1Anvil.port}`] },
      },
    };

    // Create forked network configuration
    l1ForkedNetwork = {
      ...Ethereum,
      rpcUrl: `http://127.0.0.1:${l1Anvil.port}`,
    };

    // Create clients
    l1PublicClient = createPublicClient({
      chain: l1AnvilChain,
      transport: http(),
    });

    l1WalletClient = createWalletClient({
      account: TEST_ACCOUNT,
      chain: l1AnvilChain,
      transport: http(),
    });

    // Set balance for test account using anvil (10,000 ETH)
    const res = await fetch(`http://127.0.0.1:${l1Anvil.port}`, {
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
  });

  afterAll(async () => {
    if (l1Anvil) {
      await l1Anvil.stop();
    }
  });

  test("should get balance", async () => {
    const balance = await l1PublicClient.getBalance({
      address: TEST_ACCOUNT.address,
    });
    expect(balance).toBe(parseEther("10000")); // 10,000 ETH
  });

  test("should prepare standard bridge ETH deposit transaction on L1", async () => {
    const depositAmount = parseEther("1");
    const minGasLimit = 30000;

    const preparedTxs = prepareStandardBridgeETHDeposit(l1ForkedNetwork, {
      amount: depositAmount,
      minGasLimit,
    });

    expect(preparedTxs).toHaveLength(1);

    const tx = preparedTxs[0]!;
    expect(tx.to).toBe(TEST_BRIDGE_ADDRESS);
    expect(tx.value).toBe(depositAmount);
    expect(tx.description).toBe("Bridge ETH using the standard bridge");
    console.log(`ANVIL ID`, l1AnvilChain.id);
    console.log(`FORKED ID`, l1WalletClient.chain?.id);

    const txHash = await l1WalletClient.sendTransaction({
      to: tx.to!,
      value: tx.value!,
      data: tx.data!,
      chain: l1AnvilChain,
      account: TEST_ACCOUNT,
    });
    expect(txHash).toBeDefined();
    await l1PublicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // check is has logs
    const extractedTransferID = await extractStandardBridgeTransferID(
      l1ForkedNetwork,
      txHash
    );
    expect(extractedTransferID).toBeDefined();
  });
});
