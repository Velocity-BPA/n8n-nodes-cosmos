/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { createLcdClient } from '../transport/lcdClient';
import { createTendermintClient } from '../transport/tendermintClient';
import { CosmosCredentials } from '../utils/txBuilder';

export async function executeTransactionActions(
  this: IExecuteFunctions,
  operation: string,
  credentials: CosmosCredentials,
): Promise<INodeExecutionData[]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getTx': {
          const hash = this.getNodeParameter('hash', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getTx(hash);
          break;
        }

        case 'getTxsByEvents': {
          const events = this.getNodeParameter('events', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getTxsByEvents(events);
          break;
        }

        case 'searchTx': {
          const query = this.getNodeParameter('query', i) as string;
          const page = this.getNodeParameter('page', i, 1) as number;
          const perPage = this.getNodeParameter('perPage', i, 100) as number;
          const tm = createTendermintClient(credentials);
          result = await tm.searchTx(query, page, perPage);
          break;
        }

        case 'getTxsByHeight': {
          const height = this.getNodeParameter('height', i) as number;
          const lcd = createLcdClient(credentials);
          result = await lcd.get(`/cosmos/tx/v1beta1/txs/block/${height}`);
          break;
        }

        case 'simulate': {
          const txBytes = this.getNodeParameter('txBytes', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.post('/cosmos/tx/v1beta1/simulate', { tx_bytes: txBytes });
          break;
        }

        case 'broadcastTx': {
          const txBytes = this.getNodeParameter('txBytes', i) as string;
          const mode = this.getNodeParameter('mode', i, 'BROADCAST_MODE_SYNC') as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.post('/cosmos/tx/v1beta1/txs', {
            tx_bytes: txBytes,
            mode,
          });
          break;
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      returnData.push({ json: result });
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
        continue;
      }
      throw error;
    }
  }
  return returnData;
}
