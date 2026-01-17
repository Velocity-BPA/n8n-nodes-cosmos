/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios, { AxiosInstance } from 'axios';
import { getNetworkConfig } from '../constants/networks';
import { CosmosCredentials } from '../utils/txBuilder';

export class TendermintClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(credentials: CosmosCredentials) {
    const networkConfig = getNetworkConfig(credentials.network);
    this.baseUrl = credentials.rpcEndpoint || networkConfig.rpcEndpoint;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  private async jsonRpcRequest(method: string, params?: any): Promise<any> {
    const response = await this.client.post('', {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params: params || {},
    });

    if (response.data.error) {
      throw new Error(response.data.error.message || 'JSON-RPC error');
    }

    return response.data.result;
  }

  async getStatus(): Promise<any> {
    return this.jsonRpcRequest('status');
  }

  async getNetInfo(): Promise<any> {
    return this.jsonRpcRequest('net_info');
  }

  async getHealth(): Promise<any> {
    return this.jsonRpcRequest('health');
  }

  async getGenesis(): Promise<any> {
    return this.jsonRpcRequest('genesis');
  }

  async getGenesisChunked(chunk: number): Promise<any> {
    return this.jsonRpcRequest('genesis_chunked', { chunk: chunk.toString() });
  }

  async getBlock(height?: number): Promise<any> {
    const params = height ? { height: height.toString() } : {};
    return this.jsonRpcRequest('block', params);
  }

  async getBlockResults(height?: number): Promise<any> {
    const params = height ? { height: height.toString() } : {};
    return this.jsonRpcRequest('block_results', params);
  }

  async getBlockByHash(hash: string): Promise<any> {
    return this.jsonRpcRequest('block_by_hash', { hash });
  }

  async getBlockchainInfo(minHeight: number, maxHeight: number): Promise<any> {
    return this.jsonRpcRequest('blockchain', {
      minHeight: minHeight.toString(),
      maxHeight: maxHeight.toString(),
    });
  }

  async getCommit(height?: number): Promise<any> {
    const params = height ? { height: height.toString() } : {};
    return this.jsonRpcRequest('commit', params);
  }

  async getValidators(height?: number, page = 1, perPage = 100): Promise<any> {
    const params: any = {
      page: page.toString(),
      per_page: perPage.toString(),
    };
    if (height) params.height = height.toString();
    return this.jsonRpcRequest('validators', params);
  }

  async getTx(hash: string, prove = false): Promise<any> {
    return this.jsonRpcRequest('tx', {
      hash,
      prove,
    });
  }

  async searchTx(query: string, page = 1, perPage = 100, orderBy = 'asc'): Promise<any> {
    return this.jsonRpcRequest('tx_search', {
      query,
      page: page.toString(),
      per_page: perPage.toString(),
      order_by: orderBy,
    });
  }

  async getConsensusState(): Promise<any> {
    return this.jsonRpcRequest('consensus_state');
  }

  async getConsensusParams(height?: number): Promise<any> {
    const params = height ? { height: height.toString() } : {};
    return this.jsonRpcRequest('consensus_params', params);
  }

  async getUnconfirmedTxs(limit = 30): Promise<any> {
    return this.jsonRpcRequest('unconfirmed_txs', {
      limit: limit.toString(),
    });
  }

  async getNumUnconfirmedTxs(): Promise<any> {
    return this.jsonRpcRequest('num_unconfirmed_txs');
  }

  async broadcastTxSync(tx: string): Promise<any> {
    return this.jsonRpcRequest('broadcast_tx_sync', { tx });
  }

  async broadcastTxAsync(tx: string): Promise<any> {
    return this.jsonRpcRequest('broadcast_tx_async', { tx });
  }

  async broadcastTxCommit(tx: string): Promise<any> {
    return this.jsonRpcRequest('broadcast_tx_commit', { tx });
  }

  async checkTx(tx: string): Promise<any> {
    return this.jsonRpcRequest('check_tx', { tx });
  }

  async abciQuery(path: string, data?: string, height?: number, prove = false): Promise<any> {
    const params: any = { path, prove };
    if (data) params.data = data;
    if (height) params.height = height.toString();
    return this.jsonRpcRequest('abci_query', params);
  }

  async abciInfo(): Promise<any> {
    return this.jsonRpcRequest('abci_info');
  }
}

export function createTendermintClient(credentials: CosmosCredentials): TendermintClient {
  return new TendermintClient(credentials);
}
