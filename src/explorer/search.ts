import { lightlinkPegasus, lightlinkPhoenix } from "../chains.js";

interface Protocol {
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
  protocol: Protocol;
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

export const search = async (
  chainId: number,
  query: string
): Promise<SearchItem[]> => {
  if (chainId !== lightlinkPegasus.id && chainId !== lightlinkPhoenix.id)
    throw new Error("Unsupported chain");

  const explorer =
    chainId === lightlinkPegasus.id
      ? lightlinkPegasus.blockExplorers.default
      : lightlinkPhoenix.blockExplorers.default;
  const apiUrl = explorer + "/api/v2/";
  const response = await fetch(apiUrl + "search?q=" + query);
  const data = (await response.json()) as any;

  return data.items as SearchItem[];
};
