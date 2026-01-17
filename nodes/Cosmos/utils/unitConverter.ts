/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Decimal } from '@cosmjs/math';

const ATOM_DECIMALS = 6;
const UATOM_MULTIPLIER = 1_000_000;

export function atomToUatom(atom: string | number): string {
  const atomStr = typeof atom === 'number' ? atom.toString() : atom;
  const decimal = Decimal.fromUserInput(atomStr, ATOM_DECIMALS);
  return decimal.atomics;
}

export function uatomToAtom(uatom: string | number): string {
  const uatomStr = typeof uatom === 'number' ? uatom.toString() : uatom;
  const atomValue = Number(uatomStr) / UATOM_MULTIPLIER;
  return atomValue.toString();
}

export function formatAtom(uatom: string | number, decimals = 6): string {
  const atom = uatomToAtom(uatom);
  const num = parseFloat(atom);
  return `${num.toFixed(decimals)} ATOM`;
}

export function formatCoin(amount: string | number, denom: string, decimals = 6): string {
  const displayDenom = denom.startsWith('u') ? denom.slice(1).toUpperCase() : denom.toUpperCase();
  const displayAmount = convertToDisplayAmount(amount.toString(), decimals);
  return `${displayAmount} ${displayDenom}`;
}

export function convertToDisplayAmount(amount: string, decimals = 6): string {
  const num = Number(amount) / Math.pow(10, decimals);
  return num.toFixed(decimals);
}

export function convertToMinimalAmount(amount: string, decimals = 6): string {
  const decimal = Decimal.fromUserInput(amount, decimals);
  return decimal.atomics;
}

export function parseAmount(amountString: string): { amount: string; denom: string } {
  const match = amountString.match(/^(\d+)(.+)$/);
  if (!match) {
    throw new Error(`Invalid amount string: ${amountString}`);
  }
  return {
    amount: match[1],
    denom: match[2],
  };
}

export function parseCoins(coinsString: string): Array<{ amount: string; denom: string }> {
  if (!coinsString) return [];
  return coinsString.split(',').map((coin) => parseAmount(coin.trim()));
}

export function formatCoins(coins: Array<{ amount: string; denom: string }>): string {
  return coins.map((coin) => `${coin.amount}${coin.denom}`).join(', ');
}

export function sumCoins(
  coins: Array<{ amount: string; denom: string }>,
  denom: string,
): string {
  return coins
    .filter((c) => c.denom === denom)
    .reduce((sum, c) => sum + BigInt(c.amount), BigInt(0))
    .toString();
}
