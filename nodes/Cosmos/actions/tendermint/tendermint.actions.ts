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

export async function executeTendermintActions(
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
        case 'getNodeInfo': {
          const lcd = createLcdClient(credentials);
          result = await lcd.getNodeInfo();
          break;
        }

        case 'getSyncStatus': {
          const lcd = createLcdClient(credentials);
          result = await lcd.getSyncStatus();
          break;
        }

        case 'getNetInfo': {
          const tm = createTendermintClient(credentials);
          result = await tm.getNetInfo();
          break;
        }

        case 'getHealth': {
          const tm = createTendermintClient(credentials);
          result = await tm.getHealth();
          break;
        }

        case 'getStatus': {
          const tm = createTendermintClient(credentials);
          result = await tm.getStatus();
          break;
        }

        case 'getGenesis': {
          const tm = createTendermintClient(credentials);
          result = await tm.getGenesis();
          break;
        }

        case 'getConsensusState': {
          const tm = createTendermintClient(credentials);
          result = await tm.getConsensusState();
          break;
        }

        case 'getConsensusParams': {
          const height = this.getNodeParameter('height', i, undefined) as number | undefined;
          const tm = createTendermintClient(credentials);
          result = await tm.getConsensusParams(height);
          break;
        }

        case 'getUnconfirmedTxs': {
          const limit = this.getNodeParameter('limit', i, 30) as number;
          const tm = createTendermintClient(credentials);
          result = await tm.getUnconfirmedTxs(limit);
          break;
        }

        case 'abciInfo': {
          const tm = createTendermintClient(credentials);
          result = await tm.abciInfo();
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
