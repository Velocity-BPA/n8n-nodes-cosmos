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

export async function executeBlockActions(
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
        case 'getLatestBlock': {
          const lcd = createLcdClient(credentials);
          result = await lcd.getLatestBlock();
          break;
        }

        case 'getBlockByHeight': {
          const height = this.getNodeParameter('height', i) as number;
          const lcd = createLcdClient(credentials);
          result = await lcd.getBlockByHeight(height);
          break;
        }

        case 'getBlockResults': {
          const height = this.getNodeParameter('height', i) as number;
          const tm = createTendermintClient(credentials);
          result = await tm.getBlockResults(height);
          break;
        }

        case 'getValidatorSet': {
          const height = this.getNodeParameter('height', i) as number;
          const lcd = createLcdClient(credentials);
          result = await lcd.getValidatorSetByHeight(height);
          break;
        }

        case 'getLatestValidatorSet': {
          const lcd = createLcdClient(credentials);
          result = await lcd.getLatestValidatorSet();
          break;
        }

        case 'getBlockchain': {
          const minHeight = this.getNodeParameter('minHeight', i) as number;
          const maxHeight = this.getNodeParameter('maxHeight', i) as number;
          const tm = createTendermintClient(credentials);
          result = await tm.getBlockchainInfo(minHeight, maxHeight);
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
