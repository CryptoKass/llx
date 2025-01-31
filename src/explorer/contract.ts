import type { Abi } from "viem";
import { lightlinkPegasus, lightlinkPhoenix } from "viem/chains";

export interface BaseContract {
  is_verified?: boolean;
  creation_bytecode: string;
  deployed_bytecode: string;
  has_custom_methods_read: boolean;
  has_custom_methods_write: boolean;
  implementations: any[];
  is_self_destructed: boolean;
  proxy_type: string;
}

export interface UnverifiedContract extends BaseContract {
  is_verified: undefined;
}

export interface AdditionalSource {
  file_path: string;
  source_code: string;
}

export interface VerifiedContract extends BaseContract {
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

export type Contract = UnverifiedContract | VerifiedContract;

export const getContractInfo = async (chainId: number, address: string) => {
  if (chainId !== lightlinkPegasus.id && chainId !== lightlinkPhoenix.id)
    throw new Error("Unsupported chain");

  const explorer =
    chainId === lightlinkPegasus.id
      ? lightlinkPegasus.blockExplorers.default.url
      : lightlinkPhoenix.blockExplorers.default.url;
  const apiUrl = explorer + "/api/v2/";

  const response = await fetch(apiUrl + "smart-contracts/" + address);
  const data = (await response.json()) as Contract;

  return data;
};

export const getContractAbi = async (chainId: number, address: string) => {
  const contract = await getContractInfo(chainId, address);
  if (!contract.is_verified) {
    throw new Error("Contract is not verified");
  }

  return contract.abi;
};
