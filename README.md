# LLX

![LLX](./llx.png)

LLX simplifies interacting with the main dapps on the LightLink network. Its platform agnostic and can be used with ethers, wagmi, viem, etc.

## Features

- Token Actions: fetch token info, balance, allowance, permit2 allowance
- Swaps: quote, swap
- Domain resolution: resolve ENS domain to address
- Allowance and Permit2: prepare and execute allowance and permit2 transactions
- Bridge: bridge ETH between L1 (Ethereum, Sepolia) and L2 (Phoenix, Pegasus)

## Installation

```bash
npm install --save https://github.com/CryptoKass/llx
```

## Getting Started

### Token helpers

```ts
import { fetchTokenInfo } from "llx";
import { Phoenix } from "llx/chains";

const { name, symbol, decimals, totalSupply } = await fetchTokenInfo(
  Phoenix.id,
  TOKEN_ADDRESS
);

const balance = await fetchBalance(Phoenix.id, TOKEN_ADDRESS);
```

### Swaps

```ts
import { swap } from "llx";
import { Phoenix } from "llx/chains";

const AMOUNT_IN = 1n * 10n ** 6n;
const FEE = 3000;

// First get a quote for the swap
const quote = await swap.quoteExactInput(Phoenix.id, {
  fromToken,
  toToken,
  amountIn: AMOUNT_IN,
  fee: FEE,
});

// Then prepare the swap transaction
const preparedTxs = await swap.prepareSwapExactInput(Phoenix.id, {
  tokenIn: fromToken,
  tokenOut: toToken,
  amountIn: AMOUNT_IN,
  amountOut: quote.amountOut,
  fee: FEE,
  slippage: 0.1, // 10%
});

// Finally run the prepared tx with your provider. For example using viem:
for (const tx of preparedTxs) {
  const hash = await walletClient.sendTransaction({
    account: myAccount,
    to: tx.to,
    value: tx.value,
    data: tx.data,
  });

  // wait for the tx to be mined
  await publicClient.waitForTransactionReceipt({
    hash,
  });
}
```

### Domain resolution

```ts
import { resolveEnsDomain } from "llx";
import { Phoenix } from "llx/chains";

const address = await resolveEnsDomain(Phoenix.id, "lightlink.ll");
```

### Allowance and Permit2

```ts
import { ensureAllowance } from "llx";
import { Phoenix } from "llx/chains";

// Ensure allowance will prepare approval transactions for the token
// if there is not sufficient allowance.
const txs = await ensureAllowance(
  Phoenix.id,
  TOKEN_ADDRESS,
  myAccount,
  ALLOWANCE_AMOUNT
);

// You can now run the prepared txs with your provider. For example using viem:
for (const tx of txs) {
  const hash = await walletClient.sendTransaction({
    account: myAccount,
    to: tx.to,
    value: tx.value,
    data: tx.data,
  });

  // wait for the tx to be mined
  await publicClient.waitForTransactionReceipt({
    hash,
  });
}
```

## Bridge

Only ETH bridging is supported for now.

```ts
import { bridge } from "llx";
import { Phoenix } from "llx/chains";

const txs = await bridge(Phoenix.id, {
  amount: AMOUNT,
});
```
