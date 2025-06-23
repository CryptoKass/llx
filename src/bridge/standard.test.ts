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
import {
  prepareStandardBridgeETHDeposit,
  extractStandardBridgeTransferID,
} from "./standard.js";
import { Ethereum, Phoenix, type NetworkDef } from "../chains.js";

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

describe("Standard Bridge", () => {
  let l1fork: ForkedNetwork;
  let l2fork: ForkedNetwork;

  beforeAll(async () => {
    l1fork = await setupForkedNetwork(Ethereum, 8545);
    l2fork = await setupForkedNetwork(Phoenix, 8546);
  });

  afterAll(async () => {
    if (l1fork) await l1fork.anvil.stop();
    if (l2fork) await l2fork.anvil.stop();
  });

  test("networks are setup correctly", async () => {
    const balance = await l1fork.publicClient.getBalance({
      address: TEST_ACCOUNT.address,
    });
    expect(balance).toBe(parseEther("10000")); // 10,000 ETH

    const balance2 = await l2fork.publicClient.getBalance({
      address: TEST_ACCOUNT.address,
    });
    expect(balance2).toBe(parseEther("10000")); // 10,000 ETH
  });

  test("should prepare standard bridge ETH deposit transaction on L1", async () => {
    const depositAmount = parseEther("1");
    const minGasLimit = 30000;

    const preparedTxs = prepareStandardBridgeETHDeposit(l1fork.networkDef, {
      amount: depositAmount,
      minGasLimit,
    });

    expect(preparedTxs).toHaveLength(1);

    const tx = preparedTxs[0]!;
    expect(tx.to).toBe(l1fork.networkDef.bridge?.standardBridge);
    expect(tx.value).toBe(depositAmount);
    expect(tx.description).toBe("Bridge ETH using the standard bridge");

    const txHash = await l1fork.walletClient.sendTransaction({
      to: tx.to!,
      value: tx.value!,
      data: tx.data!,
      chain: l1fork.chainDef,
      account: TEST_ACCOUNT,
    });
    expect(txHash).toBeDefined();
    await l1fork.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // check is has logs
    const extractedTransferID = await extractStandardBridgeTransferID(
      l1fork.networkDef,
      txHash
    );
    expect(extractedTransferID).toBeDefined();
  });

  test("should prepare standard bridge ETH deposit transaction on L2", async () => {
    const depositAmount = parseEther("1");
    const minGasLimit = 30000;

    const preparedTxs = prepareStandardBridgeETHDeposit(l2fork.networkDef, {
      amount: depositAmount,
      minGasLimit,
    });

    expect(preparedTxs).toHaveLength(1);

    const tx = preparedTxs[0]!;
    expect(tx.to).toBe(l2fork.networkDef.bridge?.standardBridge);
    expect(tx.value).toBe(depositAmount);
    expect(tx.description).toBe("Bridge ETH using the standard bridge");

    const txHash = await l2fork.walletClient.sendTransaction({
      to: tx.to!,
      value: tx.value!,
      data: tx.data!,
      chain: l2fork.chainDef,
      account: TEST_ACCOUNT,
    });
    expect(txHash).toBeDefined();
    await l2fork.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // check is has logs
    const extractedTransferID = await extractStandardBridgeTransferID(
      l2fork.networkDef,
      txHash
    );
    expect(extractedTransferID).toBeDefined();
  });
}, 10_000);
