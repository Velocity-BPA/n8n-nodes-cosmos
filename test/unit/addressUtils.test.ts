/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  isValidAddress,
  isValidValidatorAddress,
  isValidConsensusAddress,
  getAddressPrefix,
  convertAddressPrefix,
  accountToValidatorAddress,
  validatorToAccountAddress,
  shortenAddress,
  validateMemo,
} from '../../nodes/Cosmos/utils/addressUtils';

describe('Address Utilities', () => {
  describe('isValidAddress', () => {
    it('should validate a correct cosmos address', () => {
      const address = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
      expect(isValidAddress(address)).toBe(true);
    });

    it('should validate with expected prefix', () => {
      const address = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
      expect(isValidAddress(address, 'cosmos')).toBe(true);
    });

    it('should reject wrong prefix', () => {
      const address = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
      expect(isValidAddress(address, 'osmo')).toBe(false);
    });

    it('should reject invalid address', () => {
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('')).toBe(false);
    });
  });

  describe('isValidValidatorAddress', () => {
    it('should validate a correct validator address', () => {
      const address = 'cosmosvaloper1clpqr4nrk4khgkxj78fcwwh6dl3uw4epsluffn';
      expect(isValidValidatorAddress(address)).toBe(true);
    });

    it('should reject a non-validator address', () => {
      const address = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
      expect(isValidValidatorAddress(address)).toBe(false);
    });
  });

  describe('isValidConsensusAddress', () => {
    it('should validate with custom prefix', () => {
      const address = 'cosmosvalcons1abc123';
      expect(isValidConsensusAddress(address, 'cosmosvalcons')).toBe(true);
    });
  });

  describe('getAddressPrefix', () => {
    it('should extract prefix from cosmos address', () => {
      const address = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
      expect(getAddressPrefix(address)).toBe('cosmos');
    });

    it('should extract prefix from osmosis address', () => {
      const address = 'osmo1abc123def456';
      expect(getAddressPrefix(address)).toBe('osmo');
    });

    it('should return empty string for invalid address', () => {
      expect(getAddressPrefix('invalid')).toBe('');
    });
  });

  describe('convertAddressPrefix', () => {
    it('should convert cosmos to osmosis prefix', () => {
      const cosmosAddr = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
      const osmoAddr = convertAddressPrefix(cosmosAddr, 'osmo');
      expect(osmoAddr.startsWith('osmo')).toBe(true);
    });

    it('should throw for invalid address', () => {
      expect(() => convertAddressPrefix('invalid', 'osmo')).toThrow();
    });
  });

  describe('accountToValidatorAddress', () => {
    it('should convert account to validator address', () => {
      const account = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
      const validator = accountToValidatorAddress(account);
      expect(validator.startsWith('cosmosvaloper')).toBe(true);
    });
  });

  describe('validatorToAccountAddress', () => {
    it('should convert validator to account address', () => {
      const validator = 'cosmosvaloper1clpqr4nrk4khgkxj78fcwwh6dl3uw4epsluffn';
      const account = validatorToAccountAddress(validator);
      expect(account.startsWith('cosmos')).toBe(true);
    });
  });

  describe('shortenAddress', () => {
    it('should shorten long address', () => {
      const address = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
      const shortened = shortenAddress(address);
      expect(shortened).toContain('...');
      expect(shortened.length).toBeLessThan(address.length);
    });

    it('should not shorten short address', () => {
      const address = 'short';
      expect(shortenAddress(address)).toBe(address);
    });

    it('should use custom char count', () => {
      const address = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
      const shortened = shortenAddress(address, 4);
      expect(shortened).toBe('cosm...dd02');
    });
  });

  describe('validateMemo', () => {
    it('should accept valid memo', () => {
      expect(validateMemo('Hello World')).toBe(true);
    });

    it('should accept empty memo', () => {
      expect(validateMemo('')).toBe(true);
    });

    it('should accept memo at max length', () => {
      const memo = 'a'.repeat(256);
      expect(validateMemo(memo)).toBe(true);
    });

    it('should reject memo over max length', () => {
      const memo = 'a'.repeat(257);
      expect(validateMemo(memo)).toBe(false);
    });
  });
});
