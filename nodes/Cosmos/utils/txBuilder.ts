/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { SigningStargateClient, GasPrice, StdFee } from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { stringToPath } from '@cosmjs/crypto';
import { EncodeObject } from '@cosmjs/proto-signing';
import { getNetworkConfig } from '../constants/networks';

export interface CosmosCredentials {
  network: string;
  mnemonic: string;
  hdPath: string;
  lcdEndpoint?: string;
  rpcEndpoint?: string;
  wsEndpoint?: string;
  gasPrice: number;
  gasAdjustment: number;
  prefix?: string;
}

export interface TxResult {
  transactionHash: string;
  height: number;
  gasUsed: number;
  gasWanted: number;
  code: number;
  rawLog: string;
  events: any[];
}

export async function createWallet(credentials: CosmosCredentials): Promise<DirectSecp256k1HdWallet> {
  const networkConfig = getNetworkConfig(credentials.network);
  const prefix = credentials.prefix || networkConfig.prefix;
  const hdPath = credentials.hdPath || "m/44'/118'/0'/0/0";

  return DirectSecp256k1HdWallet.fromMnemonic(credentials.mnemonic, {
    prefix,
    hdPaths: [stringToPath(hdPath)],
  });
}

export async function getSigningClient(
  credentials: CosmosCredentials,
): Promise<SigningStargateClient> {
  const wallet = await createWallet(credentials);
  const networkConfig = getNetworkConfig(credentials.network);
  const rpcEndpoint = credentials.rpcEndpoint || networkConfig.rpcEndpoint;
  const gasPrice = GasPrice.fromString(`${credentials.gasPrice || 0.025}uatom`);

  return SigningStargateClient.connectWithSigner(rpcEndpoint, wallet, {
    gasPrice,
  });
}

export async function getAccountAddress(credentials: CosmosCredentials): Promise<string> {
  const wallet = await createWallet(credentials);
  const [account] = await wallet.getAccounts();
  return account.address;
}

export async function signAndBroadcast(
  credentials: CosmosCredentials,
  messages: EncodeObject[],
  memo = '',
  fee?: StdFee | 'auto',
): Promise<TxResult> {
  const client = await getSigningClient(credentials);
  const address = await getAccountAddress(credentials);

  const useFee = fee || 'auto';
  const result = await client.signAndBroadcast(address, messages, useFee, memo);

  return {
    transactionHash: result.transactionHash,
    height: result.height,
    gasUsed: Number(result.gasUsed),
    gasWanted: Number(result.gasWanted),
    code: result.code,
    rawLog: result.rawLog || '',
    events: result.events || [],
  };
}

export async function simulateTx(
  credentials: CosmosCredentials,
  messages: EncodeObject[],
  memo = '',
): Promise<number> {
  const client = await getSigningClient(credentials);
  const address = await getAccountAddress(credentials);

  const gasEstimate = await client.simulate(address, messages, memo);
  const gasAdjustment = credentials.gasAdjustment || 1.3;

  return Math.ceil(gasEstimate * gasAdjustment);
}

export function buildAutoFee(gasLimit: number, gasPrice: number): StdFee {
  const amount = Math.ceil(gasLimit * gasPrice);
  return {
    amount: [{ denom: 'uatom', amount: amount.toString() }],
    gas: gasLimit.toString(),
  };
}
