/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getNetworkConfig } from '../constants/networks';
import { CosmosCredentials } from '../utils/txBuilder';

export class LcdClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(credentials: CosmosCredentials) {
    const networkConfig = getNetworkConfig(credentials.network);
    this.baseUrl = credentials.lcdEndpoint || networkConfig.lcdEndpoint;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async request<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    params?: Record<string, any>,
    data?: any,
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      params,
      data,
    };

    const response = await this.client.request<T>(config);
    return response.data;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>('GET', endpoint, params);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, undefined, data);
  }

  async getAllPages<T>(
    endpoint: string,
    resultKey: string,
    params?: Record<string, any>,
  ): Promise<T[]> {
    const results: T[] = [];
    let nextKey: string | null = null;

    do {
      const queryParams: Record<string, any> = {
        ...params,
        'pagination.limit': '100',
      };

      if (nextKey) {
        queryParams['pagination.key'] = nextKey;
      }

      const response = await this.get<any>(endpoint, queryParams);
      const pageResults = response[resultKey] || [];
      results.push(...pageResults);

      nextKey = response.pagination?.next_key || null;
    } while (nextKey);

    return results;
  }

  // Bank module
  async getBalance(address: string, denom: string): Promise<any> {
    return this.get(`/cosmos/bank/v1beta1/balances/${address}/by_denom`, { denom });
  }

  async getAllBalances(address: string): Promise<any> {
    return this.get(`/cosmos/bank/v1beta1/balances/${address}`);
  }

  async getTotalSupply(): Promise<any> {
    return this.get('/cosmos/bank/v1beta1/supply');
  }

  async getSupplyOf(denom: string): Promise<any> {
    return this.get(`/cosmos/bank/v1beta1/supply/by_denom`, { denom });
  }

  // Auth module
  async getAccount(address: string): Promise<any> {
    return this.get(`/cosmos/auth/v1beta1/accounts/${address}`);
  }

  async getAccounts(): Promise<any> {
    return this.get('/cosmos/auth/v1beta1/accounts');
  }

  // Staking module
  async getValidators(status?: string): Promise<any> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    return this.get('/cosmos/staking/v1beta1/validators', params);
  }

  async getValidator(validatorAddr: string): Promise<any> {
    return this.get(`/cosmos/staking/v1beta1/validators/${validatorAddr}`);
  }

  async getDelegations(delegatorAddr: string): Promise<any> {
    return this.get(`/cosmos/staking/v1beta1/delegations/${delegatorAddr}`);
  }

  async getDelegation(delegatorAddr: string, validatorAddr: string): Promise<any> {
    return this.get(
      `/cosmos/staking/v1beta1/validators/${validatorAddr}/delegations/${delegatorAddr}`,
    );
  }

  async getUnbondingDelegations(delegatorAddr: string): Promise<any> {
    return this.get(`/cosmos/staking/v1beta1/delegators/${delegatorAddr}/unbonding_delegations`);
  }

  async getRedelegations(delegatorAddr: string): Promise<any> {
    return this.get(`/cosmos/staking/v1beta1/delegators/${delegatorAddr}/redelegations`);
  }

  async getStakingPool(): Promise<any> {
    return this.get('/cosmos/staking/v1beta1/pool');
  }

  async getStakingParams(): Promise<any> {
    return this.get('/cosmos/staking/v1beta1/params');
  }

  // Distribution module
  async getDelegationRewards(delegatorAddr: string, validatorAddr: string): Promise<any> {
    return this.get(
      `/cosmos/distribution/v1beta1/delegators/${delegatorAddr}/rewards/${validatorAddr}`,
    );
  }

  async getAllRewards(delegatorAddr: string): Promise<any> {
    return this.get(`/cosmos/distribution/v1beta1/delegators/${delegatorAddr}/rewards`);
  }

  async getWithdrawAddress(delegatorAddr: string): Promise<any> {
    return this.get(`/cosmos/distribution/v1beta1/delegators/${delegatorAddr}/withdraw_address`);
  }

  async getCommunityPool(): Promise<any> {
    return this.get('/cosmos/distribution/v1beta1/community_pool');
  }

  async getValidatorCommission(validatorAddr: string): Promise<any> {
    return this.get(`/cosmos/distribution/v1beta1/validators/${validatorAddr}/commission`);
  }

  // Governance module
  async getProposals(status?: string): Promise<any> {
    const params: Record<string, string> = {};
    if (status) params.proposal_status = status;
    return this.get('/cosmos/gov/v1beta1/proposals', params);
  }

  async getProposal(proposalId: number): Promise<any> {
    return this.get(`/cosmos/gov/v1beta1/proposals/${proposalId}`);
  }

  async getProposalDeposits(proposalId: number): Promise<any> {
    return this.get(`/cosmos/gov/v1beta1/proposals/${proposalId}/deposits`);
  }

  async getProposalVotes(proposalId: number): Promise<any> {
    return this.get(`/cosmos/gov/v1beta1/proposals/${proposalId}/votes`);
  }

  async getProposalTally(proposalId: number): Promise<any> {
    return this.get(`/cosmos/gov/v1beta1/proposals/${proposalId}/tally`);
  }

  async getVote(proposalId: number, voter: string): Promise<any> {
    return this.get(`/cosmos/gov/v1beta1/proposals/${proposalId}/votes/${voter}`);
  }

  async getGovParams(paramsType: string): Promise<any> {
    return this.get(`/cosmos/gov/v1beta1/params/${paramsType}`);
  }

  // IBC module
  async getIbcChannels(): Promise<any> {
    return this.get('/ibc/core/channel/v1/channels');
  }

  async getIbcChannel(channelId: string, portId = 'transfer'): Promise<any> {
    return this.get(`/ibc/core/channel/v1/channels/${channelId}/ports/${portId}`);
  }

  async getIbcConnections(): Promise<any> {
    return this.get('/ibc/core/connection/v1/connections');
  }

  async getIbcConnection(connectionId: string): Promise<any> {
    return this.get(`/ibc/core/connection/v1/connections/${connectionId}`);
  }

  async getIbcClients(): Promise<any> {
    return this.get('/ibc/core/client/v1/client_states');
  }

  async getDenomTrace(hash: string): Promise<any> {
    return this.get(`/ibc/apps/transfer/v1/denom_traces/${hash}`);
  }

  async getDenomTraces(): Promise<any> {
    return this.get('/ibc/apps/transfer/v1/denom_traces');
  }

  // Slashing module
  async getSigningInfos(): Promise<any> {
    return this.get('/cosmos/slashing/v1beta1/signing_infos');
  }

  async getSigningInfo(consAddress: string): Promise<any> {
    return this.get(`/cosmos/slashing/v1beta1/signing_infos/${consAddress}`);
  }

  async getSlashingParams(): Promise<any> {
    return this.get('/cosmos/slashing/v1beta1/params');
  }

  // Mint module
  async getInflation(): Promise<any> {
    return this.get('/cosmos/mint/v1beta1/inflation');
  }

  async getAnnualProvisions(): Promise<any> {
    return this.get('/cosmos/mint/v1beta1/annual_provisions');
  }

  async getMintParams(): Promise<any> {
    return this.get('/cosmos/mint/v1beta1/params');
  }

  // Transaction queries
  async getTx(hash: string): Promise<any> {
    return this.get(`/cosmos/tx/v1beta1/txs/${hash}`);
  }

  async getTxsByEvents(events: string): Promise<any> {
    return this.get('/cosmos/tx/v1beta1/txs', { events });
  }

  // Tendermint queries
  async getNodeInfo(): Promise<any> {
    return this.get('/cosmos/base/tendermint/v1beta1/node_info');
  }

  async getSyncStatus(): Promise<any> {
    return this.get('/cosmos/base/tendermint/v1beta1/syncing');
  }

  async getLatestBlock(): Promise<any> {
    return this.get('/cosmos/base/tendermint/v1beta1/blocks/latest');
  }

  async getBlockByHeight(height: number): Promise<any> {
    return this.get(`/cosmos/base/tendermint/v1beta1/blocks/${height}`);
  }

  async getLatestValidatorSet(): Promise<any> {
    return this.get('/cosmos/base/tendermint/v1beta1/validatorsets/latest');
  }

  async getValidatorSetByHeight(height: number): Promise<any> {
    return this.get(`/cosmos/base/tendermint/v1beta1/validatorsets/${height}`);
  }
}

export function createLcdClient(credentials: CosmosCredentials): LcdClient {
  return new LcdClient(credentials);
}
