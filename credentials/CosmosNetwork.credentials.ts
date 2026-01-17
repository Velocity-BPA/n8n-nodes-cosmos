/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class CosmosNetwork implements ICredentialType {
  name = 'cosmosNetworkApi';
  displayName = 'Cosmos Network';
  documentationUrl = 'https://docs.cosmos.network/';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        { name: 'Mainnet (cosmoshub-4)', value: 'mainnet' },
        { name: 'Testnet (theta-testnet-001)', value: 'testnet' },
        { name: 'Custom', value: 'custom' },
      ],
      default: 'mainnet',
      description: 'Select the Cosmos network to connect to',
    },
    {
      displayName: 'Mnemonic',
      name: 'mnemonic',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: '24-word BIP39 mnemonic phrase for signing transactions',
      placeholder: 'word1 word2 word3 ... word24',
    },
    {
      displayName: 'HD Path',
      name: 'hdPath',
      type: 'string',
      default: "m/44'/118'/0'/0/0",
      description: 'HD derivation path (Cosmos standard)',
    },
    {
      displayName: 'LCD Endpoint',
      name: 'lcdEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://rest.cosmos.directory/cosmoshub',
      description: 'Custom LCD REST API endpoint (leave empty for default)',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'RPC Endpoint',
      name: 'rpcEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://rpc.cosmos.directory/cosmoshub',
      description: 'Custom Tendermint RPC endpoint (leave empty for default)',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'WebSocket Endpoint',
      name: 'wsEndpoint',
      type: 'string',
      default: '',
      placeholder: 'wss://rpc.cosmos.directory/cosmoshub/websocket',
      description: 'Custom WebSocket endpoint for triggers',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Gas Price',
      name: 'gasPrice',
      type: 'number',
      default: 0.025,
      description: 'Gas price in uatom',
    },
    {
      displayName: 'Gas Adjustment',
      name: 'gasAdjustment',
      type: 'number',
      default: 1.3,
      description: 'Multiplier for gas estimation',
    },
    {
      displayName: 'Address Prefix',
      name: 'prefix',
      type: 'string',
      default: 'cosmos',
      description: 'Bech32 address prefix',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "mainnet" ? "https://rest.cosmos.directory/cosmoshub" : $credentials.network === "testnet" ? "https://rest.state-sync-01.theta-testnet.polypore.xyz" : $credentials.lcdEndpoint}}',
      url: '/cosmos/base/tendermint/v1beta1/node_info',
    },
  };
}
