// Uncomment the code below and write your tests
import {
  getBankAccount,
  InsufficientFundsError,
  SynchronizationFailedError,
  TransferFailedError,
} from '.';

import { random } from 'lodash';

jest.mock('lodash', () => ({
  random: jest.fn(),
}));

describe('BankAccount', () => {
  test('should create account with initial balance', () => {
    const account = getBankAccount(100);
    expect(account.getBalance()).toBe(100);
  });

  test('should throw InsufficientFundsError when withdrawing more than balance', () => {
    const account = getBankAccount(100);
    expect(() => account.withdraw(150)).toThrow(InsufficientFundsError);
    expect(() => account.withdraw(150)).toThrow(
      'Insufficient funds: cannot withdraw more than 100',
    );
  });

  test('should throw TransferFailedError when transferring to the same account', () => {
    const account = getBankAccount(100);
    expect(() => account.transfer(50, account)).toThrow(TransferFailedError);
    expect(() => account.transfer(50, account)).toThrow('Transfer failed');
  });

  test('should throw error when transferring more than balance', () => {
    const account1 = getBankAccount(100);
    const account2 = getBankAccount(50);

    expect(() => account1.transfer(150, account2)).toThrow(
      InsufficientFundsError,
    );
    expect(() => account1.transfer(150, account2)).toThrow(
      'Insufficient funds: cannot withdraw more than 100',
    );
  });

  test('should deposit money', () => {
    const account = getBankAccount(100);
    account.deposit(50);
    expect(account.getBalance()).toBe(150);
  });

  test('should withdraw money', () => {
    const account = getBankAccount(100);
    account.withdraw(50);
    expect(account.getBalance()).toBe(50);
  });

  test('should transfer money', () => {
    const account1 = getBankAccount(100);
    const account2 = getBankAccount(50);

    account1.transfer(50, account2);

    expect(account1.getBalance()).toBe(50);
    expect(account2.getBalance()).toBe(100);
  });

  test('fetchBalance should return number if request did not fail', async () => {
    (random as jest.Mock).mockReturnValueOnce(80).mockReturnValueOnce(1); // Успешный запрос

    const account = getBankAccount(100);
    const result = await account.fetchBalance();

    expect(result).toBe(80);
  });

  test('fetchBalance should return null if request failed', async () => {
    (random as jest.Mock).mockReturnValueOnce(80).mockReturnValueOnce(0); // Ошибка запроса

    const account = getBankAccount(100);
    const result = await account.fetchBalance();

    expect(result).toBeNull();
  });

  test('should set new balance if fetchBalance returned number', async () => {
    (random as jest.Mock).mockReturnValueOnce(80).mockReturnValueOnce(1); // Успешный запрос

    const account = getBankAccount(100);
    await account.synchronizeBalance();

    expect(account.getBalance()).toBe(80);
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    (random as jest.Mock).mockReturnValueOnce(80).mockReturnValueOnce(0);

    const account = getBankAccount(100);

    expect(account.getBalance()).toBe(100);

    await expect(account.synchronizeBalance()).rejects.toThrow(
      SynchronizationFailedError,
    );
  });
});
