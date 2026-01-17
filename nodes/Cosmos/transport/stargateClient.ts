/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  SigningStargateClient,
  StargateClient,
  GasPrice,
  coin,
  MsgSendEncodeObject,
  MsgDelegateEncodeObject,
  MsgUndelegateEncodeObject,
  MsgBeginRedelegateEncodeObject,
  MsgWithdrawDelegatorRewardEncodeObject,
  MsgVoteEncodeObject,
} from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { stringToPath } from '@cosmjs/crypto';
import { getNetworkConfig } from '../constants/networks';
import { CosmosCredentials, TxResult } from '../utils/txBuilder';
import { atomToUatom } from '../utils/unitConverter';

export class CosmosStargateClient {
  private credentials: CosmosCredentials;
  private signingClient: SigningStargateClient | null = null;
  private queryClient: StargateClient | null = null;
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

  async getQueryClient(): Promise<StargateClient> {
    if (!this.queryClient) {
      const networkConfig = getNetworkConfig(this.credentials.network);
      const rpcEndpoint = this.credentials.rpcEndpoint || networkConfig.rpcEndpoint;
      this.queryClient = await StargateClient.connect(rpcEndpoint);
    }
    return this.queryClient;
  }

  async getAddress(): Promise<string> {
    if (!this.address) {
      const wallet = await this.getWallet();
      const [account] = await wallet.getAccounts();
      this.address = account.address;
    }
    return this.address;
  }

  async sendTokens(
    toAddress: string,
    amount: string,
    denom = 'uatom',
    memo = '',
  ): Promise<TxResult> {
    const client = await this.getSigningClient();
    const fromAddress = await this.getAddress();

    const amountInMinimal = denom === 'uatom' ? atomToUatom(amount) : amount;
    const sendMsg: MsgSendEncodeObject = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: {
        fromAddress,
        toAddress,
        amount: [coin(amountInMinimal, denom)],
      },
    };

    const result = await client.signAndBroadcast(fromAddress, [sendMsg], 'auto', memo);
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

  async delegate(validatorAddress: string, amount: string, memo = ''): Promise<TxResult> {
    const client = await this.getSigningClient();
    const delegatorAddress = await this.getAddress();

    const delegateMsg: MsgDelegateEncodeObject = {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: {
        delegatorAddress,
        validatorAddress,
        amount: coin(atomToUatom(amount), 'uatom'),
      },
    };

    const result = await client.signAndBroadcast(delegatorAddress, [delegateMsg], 'auto', memo);
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

  async undelegate(validatorAddress: string, amount: string, memo = ''): Promise<TxResult> {
    const client = await this.getSigningClient();
    const delegatorAddress = await this.getAddress();

    const undelegateMsg: MsgUndelegateEncodeObject = {
      typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
      value: {
        delegatorAddress,
        validatorAddress,
        amount: coin(atomToUatom(amount), 'uatom'),
      },
    };

    const result = await client.signAndBroadcast(delegatorAddress, [undelegateMsg], 'auto', memo);
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

  async redelegate(
    srcValidatorAddress: string,
    dstValidatorAddress: string,
    amount: string,
    memo = '',
  ): Promise<TxResult> {
    const client = await this.getSigningClient();
    const delegatorAddress = await this.getAddress();

    const redelegateMsg: MsgBeginRedelegateEncodeObject = {
      typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
      value: {
        delegatorAddress,
        validatorSrcAddress: srcValidatorAddress,
        validatorDstAddress: dstValidatorAddress,
        amount: coin(atomToUatom(amount), 'uatom'),
      },
    };

    const result = await client.signAndBroadcast(delegatorAddress, [redelegateMsg], 'auto', memo);
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

  async withdrawRewards(validatorAddress: string, memo = ''): Promise<TxResult> {
    const client = await this.getSigningClient();
    const delegatorAddress = await this.getAddress();

    const withdrawMsg: MsgWithdrawDelegatorRewardEncodeObject = {
      typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
      value: {
        delegatorAddress,
        validatorAddress,
      },
    };

    const result = await client.signAndBroadcast(delegatorAddress, [withdrawMsg], 'auto', memo);
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

  async vote(proposalId: number, option: number, memo = ''): Promise<TxResult> {
    const client = await this.getSigningClient();
    const voter = await this.getAddress();

    const voteMsg: MsgVoteEncodeObject = {
      typeUrl: '/cosmos.gov.v1beta1.MsgVote',
      value: {
        proposalId: BigInt(proposalId),
        voter,
        option,
      },
    };

    const result = await client.signAndBroadcast(voter, [voteMsg], 'auto', memo);
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
    if (this.queryClient) {
      this.queryClient.disconnect();
      this.queryClient = null;
    }
  }
}

export function createStargateClient(credentials: CosmosCredentials): CosmosStargateClient {
  return new CosmosStargateClient(credentials);
}
