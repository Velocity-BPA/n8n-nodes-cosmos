/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import { executeAccountActions } from './actions/account';
import { executeStakingActions } from './actions/staking';
import { executeDistributionActions } from './actions/distribution';
import { executeGovernanceActions } from './actions/governance';
import { executeIbcTransferActions } from './actions/ibcTransfer';
import { executeBankActions } from './actions/bank';
import { executeAuthActions } from './actions/auth';
import { executeSlashingActions } from './actions/slashing';
import { executeMintActions } from './actions/mint';
import { executeTransactionActions } from './actions/transaction';
import { executeBlockActions } from './actions/block';
import { executeTendermintActions } from './actions/tendermint';
import { CosmosCredentials } from './utils/txBuilder';
import { IBC_CHANNELS } from './constants/ibcChannels';

// Runtime licensing notice (logged once per node load)
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]
This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licensingNoticeLogged = false;

export class Cosmos implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Cosmos',
    name: 'cosmos',
    icon: 'file:cosmos.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Cosmos Hub blockchain - ATOM transactions, staking, governance, IBC transfers',
    defaults: {
      name: 'Cosmos',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'cosmosNetworkApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Account', value: 'account' },
          { name: 'Auth', value: 'auth' },
          { name: 'Bank', value: 'bank' },
          { name: 'Block', value: 'block' },
          { name: 'Distribution', value: 'distribution' },
          { name: 'Governance', value: 'governance' },
          { name: 'IBC Transfer', value: 'ibcTransfer' },
          { name: 'Mint', value: 'mint' },
          { name: 'Slashing', value: 'slashing' },
          { name: 'Staking', value: 'staking' },
          { name: 'Tendermint', value: 'tendermint' },
          { name: 'Transaction', value: 'transaction' },
        ],
        default: 'account',
      },

      // Account Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['account'] } },
        options: [
          { name: 'Get Account Info', value: 'getAccountInfo', action: 'Get account info' },
          { name: 'Get Balance', value: 'getBalance', action: 'Get ATOM balance' },
          { name: 'Get All Balances', value: 'getAllBalances', action: 'Get all token balances' },
          { name: 'Transfer', value: 'transfer', action: 'Send ATOM' },
          { name: 'Transfer Token', value: 'transferToken', action: 'Send any token' },
          { name: 'Validate Address', value: 'validateAddress', action: 'Validate address format' },
          { name: 'Get Delegations', value: 'getDelegations', action: 'Get account delegations' },
          { name: 'Get Unbonding', value: 'getUnbonding', action: 'Get unbonding delegations' },
          { name: 'Get Redelegations', value: 'getRedelegations', action: 'Get redelegations' },
          { name: 'Get Rewards', value: 'getRewards', action: 'Get staking rewards' },
        ],
        default: 'getBalance',
      },

      // Staking Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['staking'] } },
        options: [
          { name: 'Get Validators', value: 'getValidators', action: 'List validators' },
          { name: 'Get Validator', value: 'getValidator', action: 'Get validator details' },
          { name: 'Get Validator Delegations', value: 'getValidatorDelegations', action: 'Get validator delegations' },
          { name: 'Delegate', value: 'delegate', action: 'Stake ATOM' },
          { name: 'Undelegate', value: 'undelegate', action: 'Unstake ATOM' },
          { name: 'Redelegate', value: 'redelegate', action: 'Move stake between validators' },
          { name: 'Get Delegation', value: 'getDelegation', action: 'Get delegation details' },
          { name: 'Get Unbonding Delegation', value: 'getUnbondingDelegation', action: 'Get unbonding details' },
          { name: 'Get Staking Pool', value: 'getStakingPool', action: 'Get staking pool info' },
          { name: 'Get Staking Params', value: 'getStakingParams', action: 'Get staking parameters' },
        ],
        default: 'getValidators',
      },

      // Distribution Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['distribution'] } },
        options: [
          { name: 'Get Delegation Rewards', value: 'getDelegationRewards', action: 'Get rewards from validator' },
          { name: 'Get All Rewards', value: 'getAllRewards', action: 'Get all rewards' },
          { name: 'Withdraw Rewards', value: 'withdrawRewards', action: 'Claim rewards' },
          { name: 'Withdraw All Rewards', value: 'withdrawAllRewards', action: 'Claim all rewards' },
          { name: 'Get Withdraw Address', value: 'getWithdrawAddress', action: 'Get reward address' },
          { name: 'Get Community Pool', value: 'getCommunityPool', action: 'Get community pool' },
          { name: 'Get Validator Commission', value: 'getValidatorCommission', action: 'Get commission' },
          { name: 'Get Delegator Validators', value: 'getDelegatorValidators', action: 'Get delegated validators' },
        ],
        default: 'getAllRewards',
      },

      // Governance Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['governance'] } },
        options: [
          { name: 'Get Proposals', value: 'getProposals', action: 'List proposals' },
          { name: 'Get Proposal', value: 'getProposal', action: 'Get proposal details' },
          { name: 'Get Proposal Deposits', value: 'getProposalDeposits', action: 'Get deposits' },
          { name: 'Get Proposal Votes', value: 'getProposalVotes', action: 'Get votes' },
          { name: 'Get Proposal Tally', value: 'getProposalTally', action: 'Get vote tally' },
          { name: 'Vote', value: 'vote', action: 'Cast vote' },
          { name: 'Get Vote', value: 'getVote', action: 'Get vote details' },
          { name: 'Get Gov Params', value: 'getGovParams', action: 'Get governance params' },
        ],
        default: 'getProposals',
      },

      // IBC Transfer Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['ibcTransfer'] } },
        options: [
          { name: 'IBC Transfer', value: 'ibcTransfer', action: 'Send to another chain' },
          { name: 'IBC Transfer Direct', value: 'ibcTransferDirect', action: 'Send via channel' },
          { name: 'Get Channels', value: 'getChannels', action: 'List IBC channels' },
          { name: 'Get Channel', value: 'getChannel', action: 'Get channel details' },
          { name: 'Get Connections', value: 'getConnections', action: 'List connections' },
          { name: 'Get Connection', value: 'getConnection', action: 'Get connection details' },
          { name: 'Get Clients', value: 'getClients', action: 'List light clients' },
          { name: 'Get Denom Trace', value: 'getDenomTrace', action: 'Trace IBC denom' },
          { name: 'Get Denom Traces', value: 'getDenomTraces', action: 'List denom traces' },
          { name: 'Get Available Destinations', value: 'getAvailableDestinations', action: 'List destinations' },
        ],
        default: 'getAvailableDestinations',
      },

      // Bank Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['bank'] } },
        options: [
          { name: 'Get Total Supply', value: 'getTotalSupply', action: 'Get total supply' },
          { name: 'Get Supply Of', value: 'getSupplyOf', action: 'Get supply of denom' },
          { name: 'Get Denom Metadata', value: 'getDenomMetadata', action: 'Get denom metadata' },
          { name: 'Get All Denom Metadata', value: 'getAllDenomMetadata', action: 'List denom metadata' },
          { name: 'Get Spendable Balances', value: 'getSpendableBalances', action: 'Get spendable balances' },
          { name: 'Get Send Enabled', value: 'getSendEnabled', action: 'Check send enabled' },
        ],
        default: 'getTotalSupply',
      },

      // Auth Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['auth'] } },
        options: [
          { name: 'Get Account', value: 'getAccount', action: 'Get account' },
          { name: 'Get Accounts', value: 'getAccounts', action: 'List accounts' },
          { name: 'Get Module Accounts', value: 'getModuleAccounts', action: 'List module accounts' },
          { name: 'Get Module Account', value: 'getModuleAccount', action: 'Get module account' },
          { name: 'Get Params', value: 'getParams', action: 'Get auth params' },
        ],
        default: 'getAccount',
      },

      // Slashing Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['slashing'] } },
        options: [
          { name: 'Get Signing Infos', value: 'getSigningInfos', action: 'List signing infos' },
          { name: 'Get Signing Info', value: 'getSigningInfo', action: 'Get signing info' },
          { name: 'Get Slashing Params', value: 'getSlashingParams', action: 'Get slashing params' },
        ],
        default: 'getSigningInfos',
      },

      // Mint Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['mint'] } },
        options: [
          { name: 'Get Inflation', value: 'getInflation', action: 'Get inflation rate' },
          { name: 'Get Annual Provisions', value: 'getAnnualProvisions', action: 'Get annual provisions' },
          { name: 'Get Mint Params', value: 'getMintParams', action: 'Get mint params' },
        ],
        default: 'getInflation',
      },

      // Transaction Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['transaction'] } },
        options: [
          { name: 'Get Transaction', value: 'getTx', action: 'Get transaction by hash' },
          { name: 'Get Transactions by Events', value: 'getTxsByEvents', action: 'Search transactions' },
          { name: 'Search Transactions', value: 'searchTx', action: 'Search via RPC' },
          { name: 'Get Transactions by Height', value: 'getTxsByHeight', action: 'Get block transactions' },
          { name: 'Simulate', value: 'simulate', action: 'Simulate transaction' },
          { name: 'Broadcast Transaction', value: 'broadcastTx', action: 'Broadcast transaction' },
        ],
        default: 'getTx',
      },

      // Block Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['block'] } },
        options: [
          { name: 'Get Latest Block', value: 'getLatestBlock', action: 'Get latest block' },
          { name: 'Get Block by Height', value: 'getBlockByHeight', action: 'Get block by height' },
          { name: 'Get Block Results', value: 'getBlockResults', action: 'Get block results' },
          { name: 'Get Validator Set', value: 'getValidatorSet', action: 'Get validator set' },
          { name: 'Get Latest Validator Set', value: 'getLatestValidatorSet', action: 'Get current validators' },
          { name: 'Get Blockchain', value: 'getBlockchain', action: 'Get block range' },
        ],
        default: 'getLatestBlock',
      },

      // Tendermint Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['tendermint'] } },
        options: [
          { name: 'Get Node Info', value: 'getNodeInfo', action: 'Get node info' },
          { name: 'Get Sync Status', value: 'getSyncStatus', action: 'Get sync status' },
          { name: 'Get Net Info', value: 'getNetInfo', action: 'Get network info' },
          { name: 'Get Health', value: 'getHealth', action: 'Check health' },
          { name: 'Get Status', value: 'getStatus', action: 'Get node status' },
          { name: 'Get Genesis', value: 'getGenesis', action: 'Get genesis' },
          { name: 'Get Consensus State', value: 'getConsensusState', action: 'Get consensus state' },
          { name: 'Get Consensus Params', value: 'getConsensusParams', action: 'Get consensus params' },
          { name: 'Get Unconfirmed Txs', value: 'getUnconfirmedTxs', action: 'Get mempool' },
          { name: 'ABCI Info', value: 'abciInfo', action: 'Get ABCI info' },
        ],
        default: 'getNodeInfo',
      },

      // Common Parameters
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['account', 'auth', 'bank'],
            operation: ['getAccountInfo', 'getBalance', 'getAllBalances', 'validateAddress', 'getDelegations', 'getUnbonding', 'getRedelegations', 'getRewards', 'getAccount', 'getSpendableBalances'],
          },
        },
        description: 'Cosmos address (cosmos1...)',
      },
      {
        displayName: 'To Address',
        name: 'toAddress',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['account'],
            operation: ['transfer', 'transferToken'],
          },
        },
        description: 'Recipient address',
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['transfer', 'transferToken', 'delegate', 'undelegate', 'redelegate', 'ibcTransfer', 'ibcTransferDirect'],
          },
        },
        description: 'Amount in ATOM',
      },
      {
        displayName: 'Denom',
        name: 'denom',
        type: 'string',
        default: 'uatom',
        displayOptions: {
          show: {
            operation: ['transferToken', 'ibcTransfer', 'ibcTransferDirect', 'getSupplyOf', 'getDenomMetadata'],
          },
        },
        description: 'Token denomination',
      },
      {
        displayName: 'Memo',
        name: 'memo',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['transfer', 'transferToken', 'delegate', 'undelegate', 'redelegate', 'withdrawRewards', 'withdrawAllRewards', 'vote', 'ibcTransfer', 'ibcTransferDirect'],
          },
        },
        description: 'Transaction memo (max 256 bytes)',
      },
      {
        displayName: 'Prefix',
        name: 'prefix',
        type: 'string',
        default: 'cosmos',
        displayOptions: {
          show: {
            operation: ['validateAddress'],
          },
        },
        description: 'Expected address prefix',
      },
      {
        displayName: 'Validator Address',
        name: 'validatorAddress',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['getValidator', 'getValidatorDelegations', 'delegate', 'undelegate', 'getDelegation', 'getDelegationRewards', 'withdrawRewards', 'getValidatorCommission'],
          },
        },
        description: 'Validator operator address (cosmosvaloper...)',
      },
      {
        displayName: 'Delegator Address',
        name: 'delegatorAddress',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['getDelegation', 'getUnbondingDelegation', 'getDelegationRewards', 'getAllRewards', 'withdrawAllRewards', 'getWithdrawAddress', 'getDelegatorValidators'],
          },
        },
        description: 'Delegator account address',
      },
      {
        displayName: 'Source Validator',
        name: 'srcValidatorAddress',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['redelegate'],
          },
        },
        description: 'Source validator address',
      },
      {
        displayName: 'Destination Validator',
        name: 'dstValidatorAddress',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['redelegate'],
          },
        },
        description: 'Destination validator address',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Bonded', value: 'BOND_STATUS_BONDED' },
          { name: 'Unbonding', value: 'BOND_STATUS_UNBONDING' },
          { name: 'Unbonded', value: 'BOND_STATUS_UNBONDED' },
        ],
        default: 'BOND_STATUS_BONDED',
        displayOptions: {
          show: {
            operation: ['getValidators', 'getProposals'],
          },
        },
        description: 'Filter by status',
      },
      {
        displayName: 'Proposal ID',
        name: 'proposalId',
        type: 'number',
        default: 1,
        required: true,
        displayOptions: {
          show: {
            operation: ['getProposal', 'getProposalDeposits', 'getProposalVotes', 'getProposalTally', 'vote', 'getVote'],
          },
        },
        description: 'Governance proposal ID',
      },
      {
        displayName: 'Vote Option',
        name: 'voteOption',
        type: 'options',
        options: [
          { name: 'Yes', value: 'VOTE_OPTION_YES' },
          { name: 'No', value: 'VOTE_OPTION_NO' },
          { name: 'Abstain', value: 'VOTE_OPTION_ABSTAIN' },
          { name: 'No With Veto', value: 'VOTE_OPTION_NO_WITH_VETO' },
        ],
        default: 'VOTE_OPTION_YES',
        displayOptions: {
          show: {
            operation: ['vote'],
          },
        },
        description: 'Your vote choice',
      },
      {
        displayName: 'Voter',
        name: 'voter',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['getVote'],
          },
        },
        description: 'Voter address',
      },
      {
        displayName: 'Params Type',
        name: 'paramsType',
        type: 'options',
        options: [
          { name: 'Voting', value: 'voting' },
          { name: 'Deposit', value: 'deposit' },
          { name: 'Tallying', value: 'tallying' },
        ],
        default: 'voting',
        displayOptions: {
          show: {
            operation: ['getGovParams'],
          },
        },
        description: 'Governance parameter type',
      },
      {
        displayName: 'Destination Chain',
        name: 'destinationChain',
        type: 'options',
        options: Object.entries(IBC_CHANNELS).map(([key, value]) => ({
          name: value.chain,
          value: key,
        })),
        default: 'osmosis',
        displayOptions: {
          show: {
            operation: ['ibcTransfer'],
          },
        },
        description: 'Target IBC chain',
      },
      {
        displayName: 'Receiver',
        name: 'receiver',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['ibcTransfer', 'ibcTransferDirect'],
          },
        },
        description: 'Recipient address on destination chain',
      },
      {
        displayName: 'Source Channel',
        name: 'sourceChannel',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['ibcTransferDirect'],
          },
        },
        description: 'Source channel ID (e.g., channel-141)',
      },
      {
        displayName: 'Source Port',
        name: 'sourcePort',
        type: 'string',
        default: 'transfer',
        displayOptions: {
          show: {
            operation: ['ibcTransferDirect'],
          },
        },
        description: 'Source port ID',
      },
      {
        displayName: 'Timeout Minutes',
        name: 'timeoutMinutes',
        type: 'number',
        default: 10,
        displayOptions: {
          show: {
            operation: ['ibcTransfer', 'ibcTransferDirect'],
          },
        },
        description: 'Timeout in minutes',
      },
      {
        displayName: 'Channel ID',
        name: 'channelId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['getChannel'],
          },
        },
        description: 'IBC channel ID',
      },
      {
        displayName: 'Port ID',
        name: 'portId',
        type: 'string',
        default: 'transfer',
        displayOptions: {
          show: {
            operation: ['getChannel'],
          },
        },
        description: 'IBC port ID',
      },
      {
        displayName: 'Connection ID',
        name: 'connectionId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['getConnection'],
          },
        },
        description: 'IBC connection ID',
      },
      {
        displayName: 'Hash',
        name: 'hash',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['getTx', 'getDenomTrace'],
          },
        },
        description: 'Transaction hash or IBC denom hash',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['getTxsByEvents'],
          },
        },
        description: 'Event query (e.g., transfer.sender=cosmos1...)',
      },
      {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['searchTx'],
          },
        },
        description: 'Tendermint query string',
      },
      {
        displayName: 'Height',
        name: 'height',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            operation: ['getBlockByHeight', 'getBlockResults', 'getValidatorSet', 'getTxsByHeight', 'getConsensusParams'],
          },
        },
        description: 'Block height',
      },
      {
        displayName: 'Min Height',
        name: 'minHeight',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            operation: ['getBlockchain'],
          },
        },
        description: 'Minimum block height',
      },
      {
        displayName: 'Max Height',
        name: 'maxHeight',
        type: 'number',
        default: 100,
        displayOptions: {
          show: {
            operation: ['getBlockchain'],
          },
        },
        description: 'Maximum block height',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            operation: ['searchTx'],
          },
        },
        description: 'Page number',
      },
      {
        displayName: 'Per Page',
        name: 'perPage',
        type: 'number',
        default: 100,
        displayOptions: {
          show: {
            operation: ['searchTx'],
          },
        },
        description: 'Results per page',
      },
      {
        displayName: 'TX Bytes',
        name: 'txBytes',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['simulate', 'broadcastTx'],
          },
        },
        description: 'Base64-encoded transaction bytes',
      },
      {
        displayName: 'Broadcast Mode',
        name: 'mode',
        type: 'options',
        options: [
          { name: 'Sync', value: 'BROADCAST_MODE_SYNC' },
          { name: 'Async', value: 'BROADCAST_MODE_ASYNC' },
          { name: 'Block', value: 'BROADCAST_MODE_BLOCK' },
        ],
        default: 'BROADCAST_MODE_SYNC',
        displayOptions: {
          show: {
            operation: ['broadcastTx'],
          },
        },
        description: 'Transaction broadcast mode',
      },
      {
        displayName: 'Consensus Address',
        name: 'consAddress',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['getSigningInfo'],
          },
        },
        description: 'Validator consensus address (cosmosvalcons...)',
      },
      {
        displayName: 'Module Name',
        name: 'moduleName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['getModuleAccount'],
          },
        },
        description: 'Module name',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 30,
        displayOptions: {
          show: {
            operation: ['getUnconfirmedTxs'],
          },
        },
        description: 'Maximum number of unconfirmed transactions',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Log licensing notice once
    if (!licensingNoticeLogged) {
      console.warn(LICENSING_NOTICE);
      licensingNoticeLogged = true;
    }

    const credentials = await this.getCredentials('cosmosNetworkApi') as unknown as CosmosCredentials;
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    let result: INodeExecutionData[] = [];

    switch (resource) {
      case 'account':
        result = await executeAccountActions.call(this, operation, credentials);
        break;
      case 'staking':
        result = await executeStakingActions.call(this, operation, credentials);
        break;
      case 'distribution':
        result = await executeDistributionActions.call(this, operation, credentials);
        break;
      case 'governance':
        result = await executeGovernanceActions.call(this, operation, credentials);
        break;
      case 'ibcTransfer':
        result = await executeIbcTransferActions.call(this, operation, credentials);
        break;
      case 'bank':
        result = await executeBankActions.call(this, operation, credentials);
        break;
      case 'auth':
        result = await executeAuthActions.call(this, operation, credentials);
        break;
      case 'slashing':
        result = await executeSlashingActions.call(this, operation, credentials);
        break;
      case 'mint':
        result = await executeMintActions.call(this, operation, credentials);
        break;
      case 'transaction':
        result = await executeTransactionActions.call(this, operation, credentials);
        break;
      case 'block':
        result = await executeBlockActions.call(this, operation, credentials);
        break;
      case 'tendermint':
        result = await executeTendermintActions.call(this, operation, credentials);
        break;
      default:
        throw new Error(`Unknown resource: ${resource}`);
    }

    return [result];
  }
}
