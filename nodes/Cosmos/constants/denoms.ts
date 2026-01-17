/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface DenomInfo {
  denom: string;
  symbol: string;
  decimals: number;
  name: string;
  type: 'native' | 'ibc' | 'cw20';
}

export const NATIVE_DENOMS: Record<string, DenomInfo> = {
  uatom: {
    denom: 'uatom',
    symbol: 'ATOM',
    decimals: 6,
    name: 'Cosmos Hub',
    type: 'native',
  },
};

export const IBC_DENOMS: Record<string, DenomInfo> = {
  'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': {
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    symbol: 'ATOM',
    decimals: 6,
    name: 'Cosmos Hub ATOM (via Osmosis)',
    type: 'ibc',
  },
  'ibc/14F9BC3E44B8A9C1BE1FB08980FAB87034C9905EF17CF2F5008FC085218811CC': {
    denom: 'ibc/14F9BC3E44B8A9C1BE1FB08980FAB87034C9905EF17CF2F5008FC085218811CC',
    symbol: 'OSMO',
    decimals: 6,
    name: 'Osmosis',
    type: 'ibc',
  },
  'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED': {
    denom: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
    symbol: 'JUNO',
    decimals: 6,
    name: 'Juno',
    type: 'ibc',
  },
  'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDBER56884F5D8BC9AADADC7E8': {
    denom: 'ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDBER56884F5D8BC9AADADC7E8',
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin (Noble)',
    type: 'ibc',
  },
};

export function getDenomInfo(denom: string): DenomInfo | undefined {
  return NATIVE_DENOMS[denom] || IBC_DENOMS[denom];
}

export function getDecimals(denom: string): number {
  const info = getDenomInfo(denom);
  return info?.decimals || 6;
}

export function formatDenom(denom: string): string {
  const info = getDenomInfo(denom);
  return info?.symbol || denom;
}
