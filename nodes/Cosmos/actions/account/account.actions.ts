/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { createLcdClient } from '../transport/lcdClient';
import { createStargateClient } from '../transport/stargateClient';
import { CosmosCredentials } from '../utils/txBuilder';
import { isValidAddress } from '../utils/addressUtils';
import { uatomToAtom, formatAtom } from '../utils/unitConverter';

export async function executeAccountActions(
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
        case 'getAccountInfo': {
          const address = this.getNodeParameter('address', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getAccount(address);
          break;
        }

        case 'getBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const lcd = createLcdClient(credentials);
          const balanceResult = await lcd.getBalance(address, 'uatom');
          const balance = balanceResult.balance;
          result = {
            denom: balance.denom,
            amount: balance.amount,
            displayAmount: uatomToAtom(balance.amount),
            formatted: formatAtom(balance.amount),
          };
          break;
        }

        case 'getAllBalances': {
          const address = this.getNodeParameter('address', i) as string;
          const lcd = createLcdClient(credentials);
          const balancesResult = await lcd.getAllBalances(address);
          result = {
            balances: balancesResult.balances.map((b: any) => ({
              denom: b.denom,
              amount: b.amount,
              displayAmount: b.denom === 'uatom' ? uatomToAtom(b.amount) : b.amount,
            })),
          };
          break;
        }

        case 'transfer': {
          const toAddress = this.getNodeParameter('toAddress', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const memo = this.getNodeParameter('memo', i, '') as string;
          const stargate = createStargateClient(credentials);
          result = await stargate.sendTokens(toAddress, amount, 'uatom', memo);
          await stargate.disconnect();
          break;
        }

        case 'transferToken': {
          const toAddress = this.getNodeParameter('toAddress', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const denom = this.getNodeParameter('denom', i) as string;
          const memo = this.getNodeParameter('memo', i, '') as string;
          const stargate = createStargateClient(credentials);
          result = await stargate.sendTokens(toAddress, amount, denom, memo);
          await stargate.disconnect();
          break;
        }

        case 'validateAddress': {
          const address = this.getNodeParameter('address', i) as string;
          const prefix = this.getNodeParameter('prefix', i, 'cosmos') as string;
          const isValid = isValidAddress(address, prefix);
          result = {
            address,
            isValid,
            prefix,
          };
          break;
        }

        case 'getDelegations': {
          const address = this.getNodeParameter('address', i) as string;
          const lcd = createLcdClient(credentials);
          const delegationsResult = await lcd.getDelegations(address);
          result = {
            delegations: delegationsResult.delegation_responses.map((d: any) => ({
              validatorAddress: d.delegation.validator_address,
              shares: d.delegation.shares,
              balance: {
                denom: d.balance.denom,
                amount: d.balance.amount,
                displayAmount: uatomToAtom(d.balance.amount),
              },
            })),
          };
          break;
        }

        case 'getUnbonding': {
          const address = this.getNodeParameter('address', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getUnbondingDelegations(address);
          break;
        }

        case 'getRedelegations': {
          const address = this.getNodeParameter('address', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getRedelegations(address);
          break;
        }

        case 'getRewards': {
          const address = this.getNodeParameter('address', i) as string;
          const lcd = createLcdClient(credentials);
          const rewardsResult = await lcd.getAllRewards(address);
          result = {
            rewards: rewardsResult.rewards,
            total: rewardsResult.total.map((t: any) => ({
              denom: t.denom,
              amount: t.amount,
              displayAmount: t.denom === 'uatom' ? uatomToAtom(t.amount) : t.amount,
            })),
          };
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
