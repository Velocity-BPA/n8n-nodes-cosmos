/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  atomToUatom,
  uatomToAtom,
  formatAtom,
  formatCoin,
  convertToDisplayAmount,
  convertToMinimalAmount,
  parseAmount,
  parseCoins,
  formatCoins,
  sumCoins,
} from '../../nodes/Cosmos/utils/unitConverter';

describe('Unit Converter', () => {
  describe('atomToUatom', () => {
    it('should convert ATOM string to uatom', () => {
      expect(atomToUatom('1')).toBe('1000000');
      expect(atomToUatom('0.5')).toBe('500000');
      expect(atomToUatom('0.000001')).toBe('1');
    });

    it('should convert ATOM number to uatom', () => {
      expect(atomToUatom(1)).toBe('1000000');
      expect(atomToUatom(0.5)).toBe('500000');
    });

    it('should handle zero', () => {
      expect(atomToUatom('0')).toBe('0');
      expect(atomToUatom(0)).toBe('0');
    });

    it('should handle large amounts', () => {
      expect(atomToUatom('1000000')).toBe('1000000000000');
    });
  });

  describe('uatomToAtom', () => {
    it('should convert uatom string to ATOM', () => {
      expect(uatomToAtom('1000000')).toBe('1');
      expect(uatomToAtom('500000')).toBe('0.5');
      expect(uatomToAtom('1')).toBe('0.000001');
    });

    it('should convert uatom number to ATOM', () => {
      expect(uatomToAtom(1000000)).toBe('1');
      expect(uatomToAtom(500000)).toBe('0.5');
    });

    it('should handle zero', () => {
      expect(uatomToAtom('0')).toBe('0');
      expect(uatomToAtom(0)).toBe('0');
    });
  });

  describe('formatAtom', () => {
    it('should format uatom to readable ATOM', () => {
      expect(formatAtom('1000000')).toBe('1.000000 ATOM');
      expect(formatAtom('500000')).toBe('0.500000 ATOM');
    });

    it('should respect decimal places', () => {
      expect(formatAtom('1234567', 2)).toBe('1.23 ATOM');
    });
  });

  describe('formatCoin', () => {
    it('should format uatom with denom', () => {
      expect(formatCoin('1000000', 'uatom')).toBe('1.000000 ATOM');
    });

    it('should format other denoms', () => {
      expect(formatCoin('1000000', 'uosmo')).toBe('1.000000 OSMO');
    });

    it('should handle non-u prefix denoms', () => {
      expect(formatCoin('1000000', 'inj')).toBe('1.000000 INJ');
    });
  });

  describe('convertToDisplayAmount', () => {
    it('should convert minimal to display with default decimals', () => {
      expect(convertToDisplayAmount('1000000')).toBe('1.000000');
    });

    it('should convert with custom decimals', () => {
      expect(convertToDisplayAmount('100000000', 8)).toBe('1.00000000');
    });
  });

  describe('convertToMinimalAmount', () => {
    it('should convert display to minimal with default decimals', () => {
      expect(convertToMinimalAmount('1')).toBe('1000000');
    });

    it('should convert with custom decimals', () => {
      expect(convertToMinimalAmount('1', 8)).toBe('100000000');
    });
  });

  describe('parseAmount', () => {
    it('should parse amount string', () => {
      expect(parseAmount('1000000uatom')).toEqual({
        amount: '1000000',
        denom: 'uatom',
      });
    });

    it('should parse IBC denom', () => {
      const result = parseAmount('500000ibc/ABC123');
      expect(result.amount).toBe('500000');
      expect(result.denom).toBe('ibc/ABC123');
    });

    it('should throw for invalid format', () => {
      expect(() => parseAmount('invalid')).toThrow();
    });
  });

  describe('parseCoins', () => {
    it('should parse multiple coins', () => {
      const result = parseCoins('1000000uatom, 500000uosmo');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ amount: '1000000', denom: 'uatom' });
      expect(result[1]).toEqual({ amount: '500000', denom: 'uosmo' });
    });

    it('should handle empty string', () => {
      expect(parseCoins('')).toEqual([]);
    });
  });

  describe('formatCoins', () => {
    it('should format coins array to string', () => {
      const coins = [
        { amount: '1000000', denom: 'uatom' },
        { amount: '500000', denom: 'uosmo' },
      ];
      expect(formatCoins(coins)).toBe('1000000uatom, 500000uosmo');
    });
  });

  describe('sumCoins', () => {
    it('should sum coins of same denom', () => {
      const coins = [
        { amount: '1000000', denom: 'uatom' },
        { amount: '500000', denom: 'uatom' },
        { amount: '200000', denom: 'uosmo' },
      ];
      expect(sumCoins(coins, 'uatom')).toBe('1500000');
    });

    it('should return 0 for non-existent denom', () => {
      const coins = [{ amount: '1000000', denom: 'uatom' }];
      expect(sumCoins(coins, 'uosmo')).toBe('0');
    });
  });
});
