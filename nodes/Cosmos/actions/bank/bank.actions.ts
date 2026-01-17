/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { createLcdClient } from '../transport/lcdClient';
import { CosmosCredentials } from '../utils/txBuilder';

export async function executeBankActions(
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
        case 'getTotalSupply': {
          result = await lcd.getTotalSupply();
          break;
        }

        case 'getSupplyOf': {
          const denom = this.getNodeParameter('denom', i) as string;
          result = await lcd.getSupplyOf(denom);
          break;
        }

        case 'getDenomMetadata': {
          const denom = this.getNodeParameter('denom', i) as string;
          result = await lcd.get(`/cosmos/bank/v1beta1/denoms_metadata/${denom}`);
          break;
        }

        case 'getAllDenomMetadata': {
          result = await lcd.get('/cosmos/bank/v1beta1/denoms_metadata');
          break;
        }

        case 'getSpendableBalances': {
          const address = this.getNodeParameter('address', i) as string;
          result = await lcd.get(`/cosmos/bank/v1beta1/spendable_balances/${address}`);
          break;
        }

        case 'getSendEnabled': {
          result = await lcd.get('/cosmos/bank/v1beta1/send_enabled');
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
