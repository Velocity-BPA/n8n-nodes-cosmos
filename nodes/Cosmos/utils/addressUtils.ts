/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { bech32 } from 'bech32';

export function isValidAddress(address: string, expectedPrefix?: string): boolean {
  try {
    const decoded = bech32.decode(address);
    if (expectedPrefix && decoded.prefix !== expectedPrefix) {
      return false;
    }
    return decoded.words.length > 0;
  } catch {
    return false;
  }
}

export function isValidValidatorAddress(address: string, prefix = 'cosmosvaloper'): boolean {
  return isValidAddress(address, prefix);
}

export function isValidConsensusAddress(address: string, prefix = 'cosmosvalcons'): boolean {
  return isValidAddress(address, prefix);
}

export function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

export function getAddressPrefix(address: string): string {
  try {
    const decoded = bech32.decode(address);
    return decoded.prefix;
  } catch {
    return '';
  }
}

export function convertAddressPrefix(address: string, newPrefix: string): string {
  try {
    const decoded = bech32.decode(address);
    return bech32.encode(newPrefix, decoded.words);
  } catch {
    throw new Error(`Invalid address: ${address}`);
  }
}

export function accountToValidatorAddress(accountAddress: string): string {
  return convertAddressPrefix(accountAddress, 'cosmosvaloper');
}

export function validatorToAccountAddress(validatorAddress: string): string {
  return convertAddressPrefix(validatorAddress, 'cosmos');
}

export function shortenAddress(address: string, chars = 8): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function validateMemo(memo: string): boolean {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(memo);
  return bytes.length <= 256;
}
