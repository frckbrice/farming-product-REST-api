import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockModels } from '../mocks/sequelize';
import * as userService from '../../src/services/user.service';

describe('user.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModels.User.findOne.mockResolvedValue(null);
    mockModels.User.findAll.mockResolvedValue([]);
    mockModels.User.update.mockResolvedValue([1]);
    mockModels.User.destroy.mockResolvedValue(1);
  });

  describe('getAllUsers', () => {
    it('throws AppError when no users found', async () => {
      mockModels.User.findAll.mockResolvedValue([]);

      await expect(userService.getAllUsers()).rejects.toMatchObject({
        message: 'No users found',
        statusCode: 400,
      });
    });

    it('returns users without password', async () => {
      const users = [
        { id: '1', email: 'a@test.com', password: 'secret', firstName: 'A' },
      ];
      mockModels.User.findAll.mockResolvedValue(
        users.map((u) => ({ ...u, toJSON: () => ({ ...u }) })),
      );

      const result = await userService.getAllUsers();
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('getUserById', () => {
    it('throws AppError when user not found', async () => {
      mockModels.User.findOne.mockResolvedValue(null);

      await expect(userService.getUserById('missing-id')).rejects.toMatchObject({
        message: 'No such user found',
        statusCode: 401,
      });
    });

    it('returns user without password', async () => {
      const user = {
        id: '1',
        email: 'u@test.com',
        password: 'secret',
        toJSON: () => ({ id: '1', email: 'u@test.com', password: 'secret' }),
      };
      mockModels.User.findOne.mockResolvedValue(user);

      const result = await userService.getUserById('1');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('updateUser', () => {
    it('throws AppError when user not found', async () => {
      mockModels.User.findByPk = mockModels.User.findOne;
      mockModels.User.findByPk.mockResolvedValue(null);

      await expect(
        userService.updateUser('missing', { firstName: 'X' }),
      ).rejects.toMatchObject({
        message: 'User not found',
        statusCode: 404,
      });
    });
  });

  describe('deleteUser', () => {
    it('throws AppError when user not found', async () => {
      mockModels.User.findOne.mockResolvedValue(null);

      await expect(userService.deleteUser('missing')).rejects.toMatchObject({
        message: 'No such user found',
        statusCode: 404,
      });
    });

    it('returns success message when user deleted', async () => {
      mockModels.User.findOne.mockResolvedValue({ id: '1' });
      mockModels.User.destroy.mockResolvedValue(1);

      const result = await userService.deleteUser('1');
      expect(result).toEqual({ message: 'User deleted successfully' });
    });
  });

  describe('updatePassword', () => {
    it('throws AppError for empty password', async () => {
      await expect(
        userService.updatePassword('user-id', ''),
      ).rejects.toMatchObject({
        message: 'Empty input fields',
        statusCode: 400,
      });
    });

    it('throws AppError when password too short', async () => {
      await expect(
        userService.updatePassword('user-id', 'short'),
      ).rejects.toMatchObject({
        message: 'Password must be at least 8 characters',
        statusCode: 400,
      });
    });

    it('throws AppError when user not found', async () => {
      mockModels.User.findOne.mockResolvedValue(null);

      await expect(
        userService.updatePassword('missing', 'validpassword123'),
      ).rejects.toMatchObject({
        message: 'User not found',
        statusCode: 404,
      });
    });
  });
});
