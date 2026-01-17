/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { createLcdClient } from '../transport/lcdClient';
import { CosmosCredentials } from '../utils/txBuilder';

export async function executeMintActions(
  this: IExecuteFunctions,
  operation: string,
  credentials: CosmosCredentials,
): Promise<INodeExecutionData[]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const lcd = createLcdClient(credentials);

      switch (operation) {
        case 'getInflation':
          result = await lcd.getInflation();
          break;
        case 'getAnnualProvisions':
          result = await lcd.getAnnualProvisions();
          break;
        case 'getMintParams':
          result = await lcd.getMintParams();
          break;
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
