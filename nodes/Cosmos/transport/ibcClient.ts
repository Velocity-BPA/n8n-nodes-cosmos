/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { SigningStargateClient, GasPrice } from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { stringToPath } from '@cosmjs/crypto';
import { getNetworkConfig } from '../constants/networks';
import { CosmosCredentials, TxResult } from '../utils/txBuilder';
import { atomToUatom } from '../utils/unitConverter';
import {
  getIbcChannelForDestination,
  calculateTimeout,
  formatChannelId,
  formatPortId,
} from '../utils/ibcUtils';

export class IbcClient {
  private credentials: CosmosCredentials;
  private signingClient: SigningStargateClient | null = null;
  private address: string | null = null;

  constructor(credentials: CosmosCredentials) {
    this.credentials = credentials;
  }

  private async getWallet(): Promise<DirectSecp256k1HdWallet> {
    const networkConfig = getNetworkConfig(this.credentials.network);
    const prefix = this.credentials.prefix || networkConfig.prefix;
    const hdPath = this.credentials.hdPath || "m/44'/118'/0'/0/0";

    return DirectSecp256k1HdWallet.fromMnemonic(this.credentials.mnemonic, {
      prefix,
      hdPaths: [stringToPath(hdPath)],
    });
  }

  async getSigningClient(): Promise<SigningStargateClient> {
    if (!this.signingClient) {
      const wallet = await this.getWallet();
      const networkConfig = getNetworkConfig(this.credentials.network);
      const rpcEndpoint = this.credentials.rpcEndpoint || networkConfig.rpcEndpoint;
      const gasPrice = GasPrice.fromString(`${this.credentials.gasPrice || 0.025}uatom`);

      this.signingClient = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet, {
        gasPrice,
      });
    }
    return this.signingClient;
  }

  async getAddress(): Promise<string> {
    if (!this.address) {
      const wallet = await this.getWallet();
      const [account] = await wallet.getAccounts();
      this.address = account.address;
    }
    return this.address;
  }

  async ibcTransfer(
    destinationChain: string,
    receiver: string,
    amount: string,
    denom = 'uatom',
    memo = '',
    timeoutMinutes = 10,
  ): Promise<TxResult> {
    const channel = getIbcChannelForDestination(destinationChain);
    if (!channel) {
      throw new Error(`Unknown destination chain: ${destinationChain}`);
    }

    return this.ibcTransferDirect(
      channel.channel,
      'transfer',
      receiver,
      amount,
      denom,
      memo,
      timeoutMinutes,
    );
  }

  async ibcTransferDirect(
    sourceChannel: string,
    sourcePort: string,
    receiver: string,
    amount: string,
    denom = 'uatom',
    memo = '',
    timeoutMinutes = 10,
  ): Promise<TxResult> {
    const client = await this.getSigningClient();
    const sender = await this.getAddress();
    const { timeoutTimestamp } = calculateTimeout(timeoutMinutes);

    const amountInMinimal = denom === 'uatom' ? atomToUatom(amount) : amount;

    const transferMsg = {
      typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
      value: {
        sourcePort: formatPortId(sourcePort),
        sourceChannel: formatChannelId(sourceChannel),
        token: {
          denom,
          amount: amountInMinimal,
        },
        sender,
        receiver,
        timeoutHeight: {
          revisionNumber: BigInt(0),
          revisionHeight: BigInt(0),
        },
        timeoutTimestamp,
        memo,
      },
    };

    const result = await client.signAndBroadcast(sender, [transferMsg], 'auto', memo);
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

  async disconnect(): Promise<void> {
    if (this.signingClient) {
      this.signingClient.disconnect();
      this.signingClient = null;
    }
  }
}

export function createIbcClient(credentials: CosmosCredentials): IbcClient {
  return new IbcClient(credentials);
}
