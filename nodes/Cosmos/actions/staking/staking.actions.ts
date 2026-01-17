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
import { uatomToAtom } from '../utils/unitConverter';

export async function executeStakingActions(
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
        case 'getValidators': {
          const status = this.getNodeParameter('status', i, 'BOND_STATUS_BONDED') as string;
          const lcd = createLcdClient(credentials);
          const validatorsResult = await lcd.getValidators(status);
          result = {
            validators: validatorsResult.validators.map((v: any) => ({
              operatorAddress: v.operator_address,
              consensusPubkey: v.consensus_pubkey,
              jailed: v.jailed,
              status: v.status,
              tokens: v.tokens,
              tokensDisplay: uatomToAtom(v.tokens),
              delegatorShares: v.delegator_shares,
              description: v.description,
              commission: v.commission,
            })),
          };
          break;
        }

        case 'getValidator': {
          const validatorAddress = this.getNodeParameter('validatorAddress', i) as string;
          const lcd = createLcdClient(credentials);
          const validatorResult = await lcd.getValidator(validatorAddress);
          const v = validatorResult.validator;
          result = {
            operatorAddress: v.operator_address,
            consensusPubkey: v.consensus_pubkey,
            jailed: v.jailed,
            status: v.status,
            tokens: v.tokens,
            tokensDisplay: uatomToAtom(v.tokens),
            delegatorShares: v.delegator_shares,
            description: v.description,
            commission: v.commission,
            unbondingHeight: v.unbonding_height,
            unbondingTime: v.unbonding_time,
            minSelfDelegation: v.min_self_delegation,
          };
          break;
        }

        case 'delegate': {
          const validatorAddress = this.getNodeParameter('validatorAddress', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const memo = this.getNodeParameter('memo', i, '') as string;
          const stargate = createStargateClient(credentials);
          result = await stargate.delegate(validatorAddress, amount, memo);
          await stargate.disconnect();
          break;
        }

        case 'undelegate': {
          const validatorAddress = this.getNodeParameter('validatorAddress', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const memo = this.getNodeParameter('memo', i, '') as string;
          const stargate = createStargateClient(credentials);
          result = await stargate.undelegate(validatorAddress, amount, memo);
          await stargate.disconnect();
          break;
        }

        case 'redelegate': {
          const srcValidatorAddress = this.getNodeParameter('srcValidatorAddress', i) as string;
          const dstValidatorAddress = this.getNodeParameter('dstValidatorAddress', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const memo = this.getNodeParameter('memo', i, '') as string;
          const stargate = createStargateClient(credentials);
          result = await stargate.redelegate(
            srcValidatorAddress,
            dstValidatorAddress,
            amount,
            memo,
          );
          await stargate.disconnect();
          break;
        }

        case 'getDelegation': {
          const delegatorAddress = this.getNodeParameter('delegatorAddress', i) as string;
          const validatorAddress = this.getNodeParameter('validatorAddress', i) as string;
          const lcd = createLcdClient(credentials);
          const delegationResult = await lcd.getDelegation(delegatorAddress, validatorAddress);
          const d = delegationResult.delegation_response;
          result = {
            delegatorAddress: d.delegation.delegator_address,
            validatorAddress: d.delegation.validator_address,
            shares: d.delegation.shares,
            balance: {
              denom: d.balance.denom,
              amount: d.balance.amount,
              displayAmount: uatomToAtom(d.balance.amount),
            },
          };
          break;
        }

        case 'getUnbondingDelegation': {
          const delegatorAddress = this.getNodeParameter('delegatorAddress', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getUnbondingDelegations(delegatorAddress);
          break;
        }

        case 'getStakingPool': {
          const lcd = createLcdClient(credentials);
          const poolResult = await lcd.getStakingPool();
          result = {
            notBondedTokens: poolResult.pool.not_bonded_tokens,
            notBondedTokensDisplay: uatomToAtom(poolResult.pool.not_bonded_tokens),
            bondedTokens: poolResult.pool.bonded_tokens,
            bondedTokensDisplay: uatomToAtom(poolResult.pool.bonded_tokens),
          };
          break;
        }

        case 'getStakingParams': {
          const lcd = createLcdClient(credentials);
          result = await lcd.getStakingParams();
          break;
        }

        case 'getValidatorDelegations': {
          const validatorAddress = this.getNodeParameter('validatorAddress', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.get(`/cosmos/staking/v1beta1/validators/${validatorAddress}/delegations`);
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
