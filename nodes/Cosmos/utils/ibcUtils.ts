/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IBC_CHANNELS, IbcChannel, getAvailableDestinations as getDestinations } from '../constants/ibcChannels';

export function getIbcChannelForDestination(destination: string): IbcChannel | undefined {
  return IBC_CHANNELS[destination.toLowerCase()];
}

export function getAvailableDestinations(): Array<{ name: string; value: string }> {
  return getDestinations().map((dest) => ({
    name: IBC_CHANNELS[dest].chain,
    value: dest,
  }));
}

export function calculateTimeout(minutes = 10): { timeoutTimestamp: bigint } {
  const timeoutNanos = BigInt(Date.now() + minutes * 60 * 1000) * BigInt(1_000_000);
  return { timeoutTimestamp: timeoutNanos };
}

export function parseIbcDenom(denom: string): { path: string; baseDenom: string } | null {
  if (!denom.startsWith('ibc/')) {
    return null;
  }

  const hash = denom.slice(4);
  return {
    path: hash,
    baseDenom: denom,
  };
}

export function isIbcDenom(denom: string): boolean {
  return denom.startsWith('ibc/');
}

export function formatChannelId(channel: string): string {
  if (channel.startsWith('channel-')) {
    return channel;
  }
  return `channel-${channel}`;
}

export function formatPortId(port: string): string {
  return port || 'transfer';
}

export interface IbcTransferParams {
  sourceChannel: string;
  sourcePort: string;
  receiver: string;
  amount: string;
  denom: string;
  timeoutMinutes?: number;
  memo?: string;
}

export function buildIbcTransferMsg(
  sender: string,
  params: IbcTransferParams,
): {
  typeUrl: string;
  value: {
    sourcePort: string;
    sourceChannel: string;
    token: { denom: string; amount: string };
    sender: string;
    receiver: string;
    timeoutHeight: { revisionNumber: bigint; revisionHeight: bigint };
    timeoutTimestamp: bigint;
    memo: string;
  };
} {
  const { timeoutTimestamp } = calculateTimeout(params.timeoutMinutes || 10);

  return {
    typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
    value: {
      sourcePort: formatPortId(params.sourcePort),
      sourceChannel: formatChannelId(params.sourceChannel),
      token: {
        denom: params.denom,
        amount: params.amount,
      },
      sender,
      receiver: params.receiver,
      timeoutHeight: {
        revisionNumber: BigInt(0),
        revisionHeight: BigInt(0),
      },
      timeoutTimestamp,
      memo: params.memo || '',
    },
  };
}
