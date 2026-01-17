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
import { VOTE_OPTIONS } from '../constants/modules';

export async function executeGovernanceActions(
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
        case 'getProposals': {
          const status = this.getNodeParameter('status', i, '') as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getProposals(status);
          break;
        }

        case 'getProposal': {
          const proposalId = this.getNodeParameter('proposalId', i) as number;
          const lcd = createLcdClient(credentials);
          result = await lcd.getProposal(proposalId);
          break;
        }

        case 'getProposalDeposits': {
          const proposalId = this.getNodeParameter('proposalId', i) as number;
          const lcd = createLcdClient(credentials);
          result = await lcd.getProposalDeposits(proposalId);
          break;
        }

        case 'getProposalVotes': {
          const proposalId = this.getNodeParameter('proposalId', i) as number;
          const lcd = createLcdClient(credentials);
          result = await lcd.getProposalVotes(proposalId);
          break;
        }

        case 'getProposalTally': {
          const proposalId = this.getNodeParameter('proposalId', i) as number;
          const lcd = createLcdClient(credentials);
          result = await lcd.getProposalTally(proposalId);
          break;
        }

        case 'vote': {
          const proposalId = this.getNodeParameter('proposalId', i) as number;
          const voteOption = this.getNodeParameter('voteOption', i) as string;
          const memo = this.getNodeParameter('memo', i, '') as string;

          const option =
            VOTE_OPTIONS[voteOption as keyof typeof VOTE_OPTIONS] || VOTE_OPTIONS.VOTE_OPTION_YES;

          const stargate = createStargateClient(credentials);
          result = await stargate.vote(proposalId, option, memo);
          await stargate.disconnect();
          break;
        }

        case 'getVote': {
          const proposalId = this.getNodeParameter('proposalId', i) as number;
          const voter = this.getNodeParameter('voter', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getVote(proposalId, voter);
          break;
        }

        case 'getGovParams': {
          const paramsType = this.getNodeParameter('paramsType', i, 'voting') as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getGovParams(paramsType);
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
