import { quoteExactInput, swapExactInput } from "./elektrik/index.js";
export const elektrik = {
  quoteExactInput,
  swapExactInput,
};

export { search, getContractInfo } from "./explorer/index.js";
export { resolveEnsDomain, resolveLLDomain } from "./ens.js";
export {
  fetchTokenInfo,
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
} from "./token/info.js";
export { fetchBalance } from "./token/balance.js";
export {
  fetchAllowance,
  prepareApprovalTx,
  ensureAllowance,
} from "./token/approval.js";
export {
  fetchPermit2Allowance,
  preparePermit2ApprovalTx,
  ensurePermit2Allowance,
} from "./token/permit2.js";
