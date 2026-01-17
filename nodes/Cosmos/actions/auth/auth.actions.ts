/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { createLcdClient } from '../transport/lcdClient';
import { CosmosCredentials } from '../utils/txBuilder';

export async function executeAuthActions(
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
        case 'getAccount': {
          const address = this.getNodeParameter('address', i) as string;
          result = await lcd.getAccount(address);
          break;
        }

        case 'getAccounts': {
          result = await lcd.getAccounts();
          break;
        }

        case 'getModuleAccounts': {
          result = await lcd.get('/cosmos/auth/v1beta1/module_accounts');
          break;
        }

        case 'getModuleAccount': {
          const moduleName = this.getNodeParameter('moduleName', i) as string;
          result = await lcd.get(`/cosmos/auth/v1beta1/module_accounts/${moduleName}`);
          break;
        }

        case 'getParams': {
          result = await lcd.get('/cosmos/auth/v1beta1/params');
          break;
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      returnData.push({ json: result });
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: (error as Error).message },
          pairedItem: { item: i },
        });
        continue;
      }
      throw error;
    }
  }

  return returnData;
}
