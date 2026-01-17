/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const COSMOS_MODULES = {
  bank: {
    name: 'bank',
    version: 'v1beta1',
    basePath: '/cosmos/bank/v1beta1',
    description: 'Token transfers and balances',
  },
  staking: {
    name: 'staking',
    version: 'v1beta1',
    basePath: '/cosmos/staking/v1beta1',
    description: 'Validator staking and delegation',
  },
  distribution: {
    name: 'distribution',
    version: 'v1beta1',
    basePath: '/cosmos/distribution/v1beta1',
    description: 'Staking rewards distribution',
  },
  gov: {
    name: 'gov',
    version: 'v1beta1',
    basePath: '/cosmos/gov/v1beta1',
    description: 'Governance proposals and voting',
  },
  auth: {
    name: 'auth',
    version: 'v1beta1',
    basePath: '/cosmos/auth/v1beta1',
    description: 'Account authentication',
  },
  slashing: {
    name: 'slashing',
    version: 'v1beta1',
    basePath: '/cosmos/slashing/v1beta1',
    description: 'Validator slashing',
  },
  mint: {
    name: 'mint',
    version: 'v1beta1',
    basePath: '/cosmos/mint/v1beta1',
    description: 'Token minting and inflation',
  },
  ibc: {
    name: 'ibc',
    version: 'v1',
    basePath: '/ibc',
    description: 'Inter-Blockchain Communication',
  },
  tx: {
    name: 'tx',
    version: 'v1beta1',
    basePath: '/cosmos/tx/v1beta1',
    description: 'Transaction queries',
  },
  tendermint: {
    name: 'tendermint',
    version: 'v1beta1',
    basePath: '/cosmos/base/tendermint/v1beta1',
    description: 'Tendermint node queries',
  },
};

export const VOTE_OPTIONS = {
  VOTE_OPTION_YES: 1,
  VOTE_OPTION_ABSTAIN: 2,
  VOTE_OPTION_NO: 3,
  VOTE_OPTION_NO_WITH_VETO: 4,
};

export const PROPOSAL_STATUS = {
  PROPOSAL_STATUS_UNSPECIFIED: 0,
  PROPOSAL_STATUS_DEPOSIT_PERIOD: 1,
  PROPOSAL_STATUS_VOTING_PERIOD: 2,
  PROPOSAL_STATUS_PASSED: 3,
  PROPOSAL_STATUS_REJECTED: 4,
  PROPOSAL_STATUS_FAILED: 5,
};

export const VALIDATOR_STATUS = {
  BOND_STATUS_UNSPECIFIED: 0,
  BOND_STATUS_UNBONDED: 1,
  BOND_STATUS_UNBONDING: 2,
  BOND_STATUS_BONDED: 3,
};

export const UNBONDING_PERIOD_DAYS = 21;
export const MAX_MEMO_LENGTH = 256;
