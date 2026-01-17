/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import WebSocket from 'ws';
import { getNetworkConfig } from './constants/networks';

// Runtime licensing notice
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]
This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licensingNoticeLogged = false;

interface CosmosEvent {
  type: string;
  attributes: Array<{
    key: string;
    value: string;
  }>;
}

interface TendermintEvent {
  query: string;
  data: {
    type: string;
    value: any;
  };
  events?: Record<string, string[]>;
}

export class CosmosTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Cosmos Trigger',
    name: 'cosmosTrigger',
    icon: 'file:cosmos.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["eventType"]}}',
    description: 'Listen for Cosmos Hub blockchain events via WebSocket',
    defaults: {
      name: 'Cosmos Trigger',
    },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'cosmosNetworkApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Event Type',
        name: 'eventType',
        type: 'options',
        options: [
          { name: 'New Block', value: 'newBlock' },
          { name: 'New Transaction', value: 'newTransaction' },
          { name: 'Transfer Received', value: 'transferReceived' },
          { name: 'Transfer Sent', value: 'transferSent' },
          { name: 'Delegation Created', value: 'delegationCreated' },
          { name: 'Delegation Updated', value: 'delegationUpdated' },
          { name: 'Undelegation Started', value: 'undelegationStarted' },
          { name: 'Undelegation Completed', value: 'undelegationCompleted' },
          { name: 'Redelegation Started', value: 'redelegationStarted' },
          { name: 'Rewards Withdrawn', value: 'rewardsWithdrawn' },
          { name: 'Proposal Created', value: 'proposalCreated' },
          { name: 'Proposal Voting Started', value: 'proposalVotingStarted' },
          { name: 'Proposal Voted', value: 'proposalVoted' },
          { name: 'Proposal Passed', value: 'proposalPassed' },
          { name: 'Proposal Rejected', value: 'proposalRejected' },
          { name: 'IBC Transfer Sent', value: 'ibcTransferSent' },
          { name: 'IBC Transfer Received', value: 'ibcTransferReceived' },
          { name: 'Validator Slashed', value: 'validatorSlashed' },
          { name: 'Validator Jailed', value: 'validatorJailed' },
          { name: 'Custom Query', value: 'custom' },
        ],
        default: 'newBlock',
        description: 'Type of blockchain event to listen for',
      },
      {
        displayName: 'Watch Address',
        name: 'watchAddress',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            eventType: ['transferReceived', 'transferSent', 'delegationCreated', 'delegationUpdated', 'undelegationStarted', 'rewardsWithdrawn'],
          },
        },
        description: 'Address to watch for events',
      },
      {
        displayName: 'Validator Address',
        name: 'validatorAddress',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            eventType: ['validatorSlashed', 'validatorJailed'],
          },
        },
        description: 'Validator address to watch',
      },
      {
        displayName: 'Proposal ID',
        name: 'proposalId',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            eventType: ['proposalVoted', 'proposalPassed', 'proposalRejected'],
          },
        },
        description: 'Specific proposal ID to watch (0 for all)',
      },
      {
        displayName: 'Custom Query',
        name: 'customQuery',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            eventType: ['custom'],
          },
        },
        placeholder: "tm.event='Tx' AND transfer.sender='cosmos1...'",
        description: 'Custom Tendermint event query',
      },
      {
        displayName: 'Include Raw Events',
        name: 'includeRawEvents',
        type: 'boolean',
        default: false,
        description: 'Whether to include raw event data in output',
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    // Log licensing notice once
    if (!licensingNoticeLogged) {
      console.warn(LICENSING_NOTICE);
      licensingNoticeLogged = true;
    }

    const credentials = await this.getCredentials('cosmosNetworkApi');
    const eventType = this.getNodeParameter('eventType') as string;
    const includeRawEvents = this.getNodeParameter('includeRawEvents') as boolean;

    const networkConfig = getNetworkConfig(credentials.network as string);
    const wsEndpoint = (credentials.wsEndpoint as string) || networkConfig.wsEndpoint;

    // Build query based on event type
    let query = '';
    switch (eventType) {
      case 'newBlock':
        query = "tm.event='NewBlock'";
        break;
      case 'newTransaction':
        query = "tm.event='Tx'";
        break;
      case 'transferReceived': {
        const address = this.getNodeParameter('watchAddress') as string;
        query = `tm.event='Tx' AND transfer.recipient='${address}'`;
        break;
      }
      case 'transferSent': {
        const address = this.getNodeParameter('watchAddress') as string;
        query = `tm.event='Tx' AND transfer.sender='${address}'`;
        break;
      }
      case 'delegationCreated':
      case 'delegationUpdated': {
        const address = this.getNodeParameter('watchAddress') as string;
        query = `tm.event='Tx' AND delegate.delegator='${address}'`;
        break;
      }
      case 'undelegationStarted': {
        const address = this.getNodeParameter('watchAddress') as string;
        query = `tm.event='Tx' AND unbond.delegator='${address}'`;
        break;
      }
      case 'undelegationCompleted':
        query = "tm.event='Tx' AND complete_unbonding.delegator EXISTS";
        break;
      case 'redelegationStarted':
        query = "tm.event='Tx' AND redelegate.delegator EXISTS";
        break;
      case 'rewardsWithdrawn': {
        const address = this.getNodeParameter('watchAddress') as string;
        query = `tm.event='Tx' AND withdraw_rewards.delegator='${address}'`;
        break;
      }
      case 'proposalCreated':
        query = "tm.event='Tx' AND submit_proposal.proposal_id EXISTS";
        break;
      case 'proposalVotingStarted':
        query = "tm.event='Tx' AND proposal_deposit.voting_period_start EXISTS";
        break;
      case 'proposalVoted': {
        const proposalId = this.getNodeParameter('proposalId') as number;
        if (proposalId > 0) {
          query = `tm.event='Tx' AND proposal_vote.proposal_id='${proposalId}'`;
        } else {
          query = "tm.event='Tx' AND proposal_vote.proposal_id EXISTS";
        }
        break;
      }
      case 'proposalPassed':
        query = "tm.event='Tx' AND active_proposal.proposal_result='passed'";
        break;
      case 'proposalRejected':
        query = "tm.event='Tx' AND active_proposal.proposal_result='rejected'";
        break;
      case 'ibcTransferSent':
        query = "tm.event='Tx' AND send_packet.packet_src_channel EXISTS";
        break;
      case 'ibcTransferReceived':
        query = "tm.event='Tx' AND recv_packet.packet_dst_channel EXISTS";
        break;
      case 'validatorSlashed': {
        const validator = this.getNodeParameter('validatorAddress') as string;
        if (validator) {
          query = `tm.event='Tx' AND slash.validator='${validator}'`;
        } else {
          query = "tm.event='Tx' AND slash.validator EXISTS";
        }
        break;
      }
      case 'validatorJailed':
        query = "tm.event='Tx' AND liveness.jailed_until EXISTS";
        break;
      case 'custom':
        query = this.getNodeParameter('customQuery') as string;
        break;
      default:
        query = "tm.event='NewBlock'";
    }

    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let pingTimer: NodeJS.Timeout | null = null;
    let isClosing = false;

    const connect = (): void => {
      if (isClosing) return;

      ws = new WebSocket(wsEndpoint);

      ws.on('open', () => {
        // Subscribe to events
        const subscribeMsg = {
          jsonrpc: '2.0',
          method: 'subscribe',
          id: Date.now().toString(),
          params: { query },
        };
        ws?.send(JSON.stringify(subscribeMsg));

        // Setup ping to keep connection alive
        pingTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.ping();
          }
        }, 30000);
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());

          // Skip subscription confirmation
          if (message.result && Object.keys(message.result).length === 0) {
            return;
          }

          // Process event
          if (message.result?.data) {
            const eventData = message.result.data as TendermintEvent['data'];
            const events = message.result.events as Record<string, string[]> | undefined;

            const output: Record<string, any> = {
              eventType,
              timestamp: new Date().toISOString(),
              type: eventData.type,
              data: eventData.value,
            };

            // Parse specific events for cleaner output
            if (events) {
              output.parsedEvents = parseEvents(events);
            }

            if (includeRawEvents) {
              output.raw = message;
            }

            this.emit([this.helpers.returnJsonArray([output])]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error.message);
      });

      ws.on('close', () => {
        if (pingTimer) {
          clearInterval(pingTimer);
          pingTimer = null;
        }

        // Attempt to reconnect after 5 seconds
        if (!isClosing) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      });
    };

    // Start connection
    connect();

    // Cleanup function
    const closeFunction = async (): Promise<void> => {
      isClosing = true;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }

      if (ws) {
        ws.close();
        ws = null;
      }
    };

    return {
      closeFunction,
    };
  }
}

function parseEvents(events: Record<string, string[]>): Record<string, any> {
  const parsed: Record<string, any> = {};

  for (const [key, values] of Object.entries(events)) {
    if (values.length === 1) {
      parsed[key] = values[0];
    } else if (values.length > 1) {
      parsed[key] = values;
    }
  }

  return parsed;
}
