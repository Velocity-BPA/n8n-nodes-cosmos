/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { createLcdClient } from '../transport/lcdClient';
import { createIbcClient } from '../transport/ibcClient';
import { CosmosCredentials } from '../utils/txBuilder';
import { getAvailableDestinations, getIbcChannelForDestination } from '../utils/ibcUtils';
import { IBC_CHANNELS } from '../constants/ibcChannels';

export async function executeIbcTransferActions(
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
        case 'ibcTransfer': {
          const destinationChain = this.getNodeParameter('destinationChain', i) as string;
          const receiver = this.getNodeParameter('receiver', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const denom = this.getNodeParameter('denom', i, 'uatom') as string;
          const memo = this.getNodeParameter('memo', i, '') as string;
          const timeoutMinutes = this.getNodeParameter('timeoutMinutes', i, 10) as number;

          const ibc = createIbcClient(credentials);
          result = await ibc.ibcTransfer(
            destinationChain,
            receiver,
            amount,
            denom,
            memo,
            timeoutMinutes,
          );
          await ibc.disconnect();
          break;
        }

        case 'ibcTransferDirect': {
          const sourceChannel = this.getNodeParameter('sourceChannel', i) as string;
          const sourcePort = this.getNodeParameter('sourcePort', i, 'transfer') as string;
          const receiver = this.getNodeParameter('receiver', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const denom = this.getNodeParameter('denom', i, 'uatom') as string;
          const memo = this.getNodeParameter('memo', i, '') as string;
          const timeoutMinutes = this.getNodeParameter('timeoutMinutes', i, 10) as number;

          const ibc = createIbcClient(credentials);
          result = await ibc.ibcTransferDirect(
            sourceChannel,
            sourcePort,
            receiver,
            amount,
            denom,
            memo,
            timeoutMinutes,
          );
          await ibc.disconnect();
          break;
        }

        case 'getChannels': {
          const lcd = createLcdClient(credentials);
          result = await lcd.getIbcChannels();
          break;
        }

        case 'getChannel': {
          const channelId = this.getNodeParameter('channelId', i) as string;
          const portId = this.getNodeParameter('portId', i, 'transfer') as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getIbcChannel(channelId, portId);
          break;
        }

        case 'getConnections': {
          const lcd = createLcdClient(credentials);
          result = await lcd.getIbcConnections();
          break;
        }

        case 'getConnection': {
          const connectionId = this.getNodeParameter('connectionId', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getIbcConnection(connectionId);
          break;
        }

        case 'getClients': {
          const lcd = createLcdClient(credentials);
          result = await lcd.getIbcClients();
          break;
        }

        case 'getDenomTrace': {
          const hash = this.getNodeParameter('hash', i) as string;
          const lcd = createLcdClient(credentials);
          result = await lcd.getDenomTrace(hash);
          break;
        }

        case 'getDenomTraces': {
          const lcd = createLcdClient(credentials);
          result = await lcd.getDenomTraces();
          break;
        }

        case 'getAvailableDestinations': {
          const destinations = getAvailableDestinations();
          result = {
            destinations: destinations.map((d) => {
              const channel = getIbcChannelForDestination(d.value);
              return {
                ...d,
                channel: channel?.channel,
                chainId: channel?.chainId,
                prefix: channel?.prefix,
              };
            }),
            count: destinations.length,
          };
          break;
        }

        case 'getChannelInfo': {
          const destination = this.getNodeParameter('destination', i) as string;
          const channel = IBC_CHANNELS[destination.toLowerCase()];
          if (!channel) {
            throw new Error(`Unknown destination: ${destination}`);
          }
          result = channel;
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
