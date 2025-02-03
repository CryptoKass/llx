import { Abi, Address } from 'viem';

interface PreparedTx {
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
    gasLimit?: bigint;
    gasPrice?: bigint;
    description?: string;
}

interface SwapExactInputParams {
    tokenIn: `0x${string}`;
    tokenOut: `0x${string}`;
    amountIn: bigint;
    amountOut: bigint;
    fee: number;
    slippage: number;
}

interface QuoteExactInputSingleParams {
    fromToken: `0x${string}`;
    toToken: `0x${string}`;
    amountIn: bigint;
    fee: number;
}
interface QuoteResult {
    amountOut: bigint;
    sqrtPriceX96After: bigint;
    initializedTicksCrossed: bigint;
    gasEstimate: bigint;
}

interface EnsProtocol {
    deployment_blockscout_base_url: string;
    description: string;
    docs_url: string;
    icon_url: string;
    id: string;
    short_name: string;
    title: string;
    tld_list: string[];
}
interface EnsInfo {
    name: string;
    protocol: EnsProtocol;
    address_hash: string;
    expiry_date: string;
    names_count: number;
}
interface BaseItem {
    address: string;
    certified: boolean;
    is_smart_contract_verified: boolean;
    name: string | null;
    priority: number;
    type: string;
    url: string;
}
interface EnsDomainItem extends BaseItem {
    type: "ens_domain";
    ens_info: EnsInfo;
}
interface ContractItem extends BaseItem {
    type: "contract";
    ens_info: null;
}
interface AddressItem extends BaseItem {
    type: "address";
    ens_info: null;
}
interface TokenItem extends BaseItem {
    type: "token";
    address_url: string;
    circulating_market_cap: number | null;
    exchange_rate: number | null;
    icon_url: string;
    is_verified_via_admin_panel: boolean;
    symbol: string;
    token_type: string;
    token_url: string;
    total_supply: string;
}
type SearchItem = EnsDomainItem | ContractItem | AddressItem | TokenItem;
declare const search: (chainId: number, query: string) => Promise<SearchItem[]>;

interface BaseContract {
    is_verified?: boolean;
    creation_bytecode: string;
    deployed_bytecode: string;
    has_custom_methods_read: boolean;
    has_custom_methods_write: boolean;
    implementations: any[];
    is_self_destructed: boolean;
    proxy_type: string;
}
interface UnverifiedContract extends BaseContract {
    is_verified: undefined;
}
interface AdditionalSource {
    file_path: string;
    source_code: string;
}
interface VerifiedContract extends BaseContract {
    is_verified: true;
    name: string;
    is_blueprint: boolean;
    license_type: string;
    is_fully_verified: boolean;
    is_vyper_contract: boolean;
    is_verified_via_eth_bytecode_db: boolean;
    language: string;
    evm_version: string;
    file_path: string;
    source_code: string;
    optimization_enabled: boolean;
    verified_twin_address_hash: string;
    compiler_settings: {
        libraries: any;
        optimizer: {
            enabled: boolean;
            runs: number;
        };
        outputSelection: {
            [key: string]: string[];
        };
    };
    optimization_runs: number;
    sourcify_repo_url: string;
    decoded_constructor_args: any[];
    compiler_version: string;
    is_verified_via_verifier_alliance: boolean;
    verified_at: string;
    external_libraries: any[];
    additional_sources: AdditionalSource[];
    abi: Abi;
    is_changed_bytecode: boolean;
    is_partially_verified: boolean;
    constructor_args: string;
}
type Contract = UnverifiedContract | VerifiedContract;
declare const getContractInfo: (chainId: number, address: string) => Promise<Contract>;

declare const resolveEnsDomain: (name: string) => Promise<`0x${string}`>;
declare const resolveLLDomain: (normalizedDomain: string) => Promise<`0x${string}`>;

declare const fetchTokenName: (chainId: number, address: Address) => Promise<string>;
declare const fetchTokenSymbol: (chainId: number, address: Address) => Promise<string>;
declare const fetchTokenDecimals: (chainId: number, address: Address) => Promise<number>;
declare const fetchTokenTotalSupply: (chainId: number, address: Address) => Promise<bigint>;
declare const fetchTokenInfo: (chainId: number, address: Address) => Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: bigint;
}>;

declare const fetchBalance: (chainId: number, token: Address, account: Address) => Promise<bigint>;

declare function prepareApprovalTx(token: `0x${string}`, target: `0x${string}`, amount: bigint): PreparedTx;
declare function fetchAllowance(chainId: number, token: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`): Promise<bigint>;
declare function ensureAllowance(chainId: number, token: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`, amount: bigint): Promise<PreparedTx[]>;

declare function preparePermit2ApprovalTx(chainId: number, token: `0x${string}`, target: `0x${string}`, amount: bigint, deadline: number): PreparedTx;
declare function fetchPermit2Allowance(chainId: number, owner: `0x${string}`, token: `0x${string}`, spender: `0x${string}`): Promise<bigint>;
declare function ensurePermit2Allowance(chainId: number, token: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`, amount: bigint): Promise<PreparedTx[]>;

declare const elektrik: {
    quoteExactInput: (chainId: number, params: QuoteExactInputSingleParams) => Promise<QuoteResult>;
    swapExactInput: (chainId: number, sender: `0x${string}`, params: SwapExactInputParams) => Promise<PreparedTx[]>;
};
declare const weth: {
    prepareWrapTx: (chainId: number, amount: bigint) => PreparedTx;
    prepareUnwrapTx: (chainId: number, amount: bigint) => PreparedTx;
};

export { elektrik, ensureAllowance, ensurePermit2Allowance, fetchAllowance, fetchBalance, fetchPermit2Allowance, fetchTokenDecimals, fetchTokenInfo, fetchTokenName, fetchTokenSymbol, fetchTokenTotalSupply, getContractInfo, prepareApprovalTx, preparePermit2ApprovalTx, resolveEnsDomain, resolveLLDomain, search, weth };
