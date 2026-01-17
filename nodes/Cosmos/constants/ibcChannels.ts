/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface IbcChannel {
  chain: string;
  chainId: string;
  channel: string;
  port: string;
  counterpartyChannel: string;
  counterpartyPort: string;
  prefix: string;
  denom: string;
}

export const IBC_CHANNELS: Record<string, IbcChannel> = {
  osmosis: {
    chain: 'Osmosis',
    chainId: 'osmosis-1',
    channel: 'channel-141',
    port: 'transfer',
    counterpartyChannel: 'channel-0',
    counterpartyPort: 'transfer',
    prefix: 'osmo',
    denom: 'uosmo',
  },
  juno: {
    chain: 'Juno',
    chainId: 'juno-1',
    channel: 'channel-207',
    port: 'transfer',
    counterpartyChannel: 'channel-1',
    counterpartyPort: 'transfer',
    prefix: 'juno',
    denom: 'ujuno',
  },
  secret: {
    chain: 'Secret Network',
    chainId: 'secret-4',
    channel: 'channel-235',
    port: 'transfer',
    counterpartyChannel: 'channel-0',
    counterpartyPort: 'transfer',
    prefix: 'secret',
    denom: 'uscrt',
  },
  stargaze: {
    chain: 'Stargaze',
    chainId: 'stargaze-1',
    channel: 'channel-730',
    port: 'transfer',
    counterpartyChannel: 'channel-239',
    counterpartyPort: 'transfer',
    prefix: 'stars',
    denom: 'ustars',
  },
  noble: {
    chain: 'Noble',
    chainId: 'noble-1',
    channel: 'channel-536',
    port: 'transfer',
    counterpartyChannel: 'channel-4',
    counterpartyPort: 'transfer',
    prefix: 'noble',
    denom: 'uusdc',
  },
  akash: {
    chain: 'Akash',
    chainId: 'akashnet-2',
    channel: 'channel-184',
    port: 'transfer',
    counterpartyChannel: 'channel-17',
    counterpartyPort: 'transfer',
    prefix: 'akash',
    denom: 'uakt',
  },
  kava: {
    chain: 'Kava',
    chainId: 'kava_2222-10',
    channel: 'channel-277',
    port: 'transfer',
    counterpartyChannel: 'channel-0',
    counterpartyPort: 'transfer',
    prefix: 'kava',
    denom: 'ukava',
  },
  injective: {
    chain: 'Injective',
    chainId: 'injective-1',
    channel: 'channel-220',
    port: 'transfer',
    counterpartyChannel: 'channel-1',
    counterpartyPort: 'transfer',
    prefix: 'inj',
    denom: 'inj',
  },
  stride: {
    chain: 'Stride',
    chainId: 'stride-1',
    channel: 'channel-391',
    port: 'transfer',
    counterpartyChannel: 'channel-0',
    counterpartyPort: 'transfer',
    prefix: 'stride',
    denom: 'ustrd',
  },
  celestia: {
    chain: 'Celestia',
    chainId: 'celestia',
    channel: 'channel-617',
    port: 'transfer',
    counterpartyChannel: 'channel-1',
    counterpartyPort: 'transfer',
    prefix: 'celestia',
    denom: 'utia',
  },
  dydx: {
    chain: 'dYdX',
    chainId: 'dydx-mainnet-1',
    channel: 'channel-750',
    port: 'transfer',
    counterpartyChannel: 'channel-0',
    counterpartyPort: 'transfer',
    prefix: 'dydx',
    denom: 'adydx',
  },
  neutron: {
    chain: 'Neutron',
    chainId: 'neutron-1',
    channel: 'channel-569',
    port: 'transfer',
    counterpartyChannel: 'channel-1',
    counterpartyPort: 'transfer',
    prefix: 'neutron',
    denom: 'untrn',
  },
};

export function getIbcChannel(destination: string): IbcChannel | undefined {
  return IBC_CHANNELS[destination.toLowerCase()];
}

export function getAvailableDestinations(): string[] {
  return Object.keys(IBC_CHANNELS);
}
