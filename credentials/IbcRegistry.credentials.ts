/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class IbcRegistry implements ICredentialType {
  name = 'ibcRegistry';
  displayName = 'IBC Registry';
  documentationUrl = 'https://github.com/cosmos/chain-registry';
  properties: INodeProperties[] = [
    {
      displayName: 'Registry Source',
      name: 'registrySource',
      type: 'options',
      options: [
        { name: 'Chain Registry (GitHub)', value: 'github' },
        { name: 'Cosmos Directory', value: 'cosmos_directory' },
        { name: 'Custom', value: 'custom' },
      ],
      default: 'cosmos_directory',
      description: 'Source for chain and IBC path information',
    },
    {
      displayName: 'Custom Registry URL',
      name: 'customRegistryUrl',
      type: 'string',
      default: '',
      placeholder: 'https://registry.example.com',
      description: 'Custom registry endpoint',
      displayOptions: {
        show: {
          registrySource: ['custom'],
        },
      },
    },
    {
      displayName: 'Cache Duration (seconds)',
      name: 'cacheDuration',
      type: 'number',
      default: 3600,
      description: 'How long to cache registry data',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };
}
