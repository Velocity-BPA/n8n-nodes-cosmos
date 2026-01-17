/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface NetworkConfig {
  chainId: string;
  lcdEndpoint: string;
  rpcEndpoint: string;
  wsEndpoint: string;
  prefix: string;
  denom: string;
  minDenom: string;
  decimals: number;
  gasPrice: number;
  explorer: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    chainId: 'cosmoshub-4',
    lcdEndpoint: 'https://rest.cosmos.directory/cosmoshub',
    rpcEndpoint: 'https://rpc.cosmos.directory/cosmoshub',
    wsEndpoint: 'wss://rpc.cosmos.directory/cosmoshub/websocket',
    prefix: 'cosmos',
    denom: 'ATOM',
    minDenom: 'uatom',
    decimals: 6,
    gasPrice: 0.025,
    explorer: 'https://www.mintscan.io/cosmos',
  },
  testnet: {
    chainId: 'theta-testnet-001',
    lcdEndpoint: 'https://rest.state-sync-01.theta-testnet.polypore.xyz',
    rpcEndpoint: 'https://rpc.state-sync-01.theta-testnet.polypore.xyz',
    wsEndpoint: 'wss://rpc.state-sync-01.theta-testnet.polypore.xyz/websocket',
    prefix: 'cosmos',
    denom: 'ATOM',
    minDenom: 'uatom',
    decimals: 6,
    gasPrice: 0.025,
    explorer: 'https://explorer.theta-testnet.polypore.xyz',
  },
};

export function getNetworkConfig(network: string, custom?: Partial<NetworkConfig>): NetworkConfig {
  if (network === 'custom' && custom) {
    return {
      chainId: custom.chainId || 'custom-chain',
      lcdEndpoint: custom.lcdEndpoint || '',
      rpcEndpoint: custom.rpcEndpoint || '',
      wsEndpoint: custom.wsEndpoint || '',
      prefix: custom.prefix || 'cosmos',
      denom: custom.denom || 'ATOM',
      minDenom: custom.minDenom || 'uatom',
      decimals: custom.decimals || 6,
      gasPrice: custom.gasPrice || 0.025,
      explorer: custom.explorer || '',
    };
  }
  return NETWORKS[network] || NETWORKS.mainnet;
}
