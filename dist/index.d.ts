import { Address, Abi } from 'viem';

interface PreparedTx {
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
    gasLimit?: bigint;
    gasPrice?: bigint;
    description?: string;
}

interface Network {
    id: number;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    uniswapv3?: {
        quoter: string;
        router: string;
        factory: string;
    };
    bridge?: {
        standardBridge?: Address;
    };
    ens?: {
        resolver: string;
    };
    permit2: string;
    weth: string;
}
type ChainRef = number | Network;

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
declare const search: (chainRef: ChainRef, query: string) => Promise<SearchItem[]>;

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
declare const getContractInfo: (chainRef: ChainRef, address: string) => Promise<Contract>;

declare const resolveEnsDomain: (name: string) => Promise<`0x${string}`>;
declare const resolveLLDomain: (normalizedDomain: string) => Promise<`0x${string}`>;

declare const fetchTokenName: (chainRef: ChainRef, address: Address) => Promise<string>;
declare const fetchTokenSymbol: (chainRef: ChainRef, address: Address) => Promise<string>;
declare const fetchTokenDecimals: (chainRef: ChainRef, address: Address) => Promise<number>;
declare const fetchTokenTotalSupply: (chainRef: ChainRef, address: Address) => Promise<bigint>;
declare const fetchTokenInfo: (chainRef: ChainRef, address: Address) => Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: bigint;
}>;

declare const fetchBalance: (chainRef: ChainRef, token: Address, account: Address) => Promise<bigint>;

declare function prepareApprovalTx(token: `0x${string}`, target: `0x${string}`, amount: bigint): PreparedTx;
declare function fetchAllowance(chainRef: ChainRef, token: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`): Promise<bigint>;
declare function ensureAllowance(chainRef: ChainRef, token: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`, amount: bigint): Promise<PreparedTx[]>;

declare function preparePermit2ApprovalTx(chainRef: ChainRef, token: `0x${string}`, target: `0x${string}`, amount: bigint, deadline: number): PreparedTx;
declare function fetchPermit2Allowance(chainRef: ChainRef, owner: `0x${string}`, token: `0x${string}`, spender: `0x${string}`): Promise<bigint>;
declare function ensurePermit2Allowance(chainRef: ChainRef, token: `0x${string}`, owner: `0x${string}`, spender: `0x${string}`, amount: bigint): Promise<PreparedTx[]>;

interface BridgeParams {
    amount: bigint;
    token?: "eth" | Address;
    bridgeAddress?: Address;
    minGasLimit?: number;
}
declare const prepareBridgeTransfer: (chainRef: ChainRef, params: BridgeParams) => PreparedTx[];

declare const swap: {
    quoteExactInput: (chainRef: ChainRef, params: QuoteExactInputSingleParams) => Promise<QuoteResult>;
    swapExactInput: (chainRef: ChainRef, sender: `0x${string}`, params: SwapExactInputParams) => Promise<PreparedTx[]>;
};
declare const weth: {
    prepareWrapTx: (chainRef: ChainRef, amount: bigint) => PreparedTx;
    prepareUnwrapTx: (chainRef: ChainRef, amount: bigint) => PreparedTx;
};

export { ensureAllowance, ensurePermit2Allowance, fetchAllowance, fetchBalance, fetchPermit2Allowance, fetchTokenDecimals, fetchTokenInfo, fetchTokenName, fetchTokenSymbol, fetchTokenTotalSupply, getContractInfo, prepareApprovalTx, prepareBridgeTransfer, preparePermit2ApprovalTx, resolveEnsDomain, resolveLLDomain, search, swap, weth };
