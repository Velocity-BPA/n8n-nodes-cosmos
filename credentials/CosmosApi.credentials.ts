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

export class CosmosApi implements ICredentialType {
  name = 'cosmosApi';
  displayName = 'Cosmos API';
  documentationUrl = 'https://docs.mintscan.io/';
  properties: INodeProperties[] = [
    {
      displayName: 'API Provider',
      name: 'provider',
      type: 'options',
      options: [
        { name: 'Mintscan', value: 'mintscan' },
        { name: 'Numia', value: 'numia' },
        { name: 'Custom', value: 'custom' },
      ],
      default: 'mintscan',
      description: 'Select API provider for enhanced data',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'API key for the selected provider',
    },
    {
      displayName: 'Custom API URL',
      name: 'customUrl',
      type: 'string',
      default: '',
      placeholder: 'https://api.example.com',
      description: 'Custom API endpoint URL',
      displayOptions: {
        show: {
          provider: ['custom'],
        },
      },
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{"Bearer " + $credentials.apiKey}}',
      },
    },
  };
}
