/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { createLcdClient } from '../transport/lcdClient';
import { CosmosCredentials } from '../utils/txBuilder';

export async function executeSlashingActions(
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
        case 'getSigningInfos':
          result = await lcd.getSigningInfos();
          break;
        case 'getSigningInfo': {
          const consAddress = this.getNodeParameter('consAddress', i) as string;
          result = await lcd.getSigningInfo(consAddress);
          break;
        }
        case 'getSlashingParams':
          result = await lcd.getSlashingParams();
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
