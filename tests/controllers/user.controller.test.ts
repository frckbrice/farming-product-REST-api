import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockRequest, mockResponse, mockNext } from '../utils/testHelpers';
import * as userController from '../../src/controllers/user.controller';
import * as userService from '../../src/services/user.service';
import { AppError } from '../../src/errors';

vi.mock('../../src/services/user.service');
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockResolvedValue({ secure_url: 'https://test.cloudinary.com/image.jpg' }),
    },
  },
}));

describe('user.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUserData', () => {
    it('returns 200 and users when service succeeds', async () => {
      const users = [{ id: '1', email: 'a@test.com', firstName: 'A' }];
      vi.mocked(userService.getAllUsers).mockResolvedValue(users as never);

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await userController.getAllUserData(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('returns 400 when AppError (no users)', async () => {
      vi.mocked(userService.getAllUsers).mockRejectedValue(new AppError('No users found', 400));

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await userController.getAllUserData(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No users found' });
    });
  });

  describe('getUserData', () => {
    it('returns 200 and user when found', async () => {
      const user = { id: '1', email: 'u@test.com', firstName: 'U' };
      vi.mocked(userService.getUserById).mockResolvedValue(user as never);

      const req = mockRequest<{ userId: string }>({ params: { userId: '1' } });
      const res = mockResponse();
      const next = mockNext();

      await userController.getUserData(req as never, res as never, next);

      expect(userService.getUserById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('returns 401 when user not found', async () => {
      vi.mocked(userService.getUserById).mockRejectedValue(new AppError('No such user found', 401));

      const req = mockRequest<{ userId: string }>({ params: { userId: 'missing' } });
      const res = mockResponse();
      const next = mockNext();

      await userController.getUserData(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No such user found' });
    });
  });

  describe('updateUser', () => {
    it('returns 200 and result when update succeeds', async () => {
      const result = { message: 'Updated', userData: { id: '1', firstName: 'New' } };
      vi.mocked(userService.updateUser).mockResolvedValue(result as never);

      const req = mockRequest<{ userId: string }, { firstName: string }>({
        params: { userId: '1' },
        body: { firstName: 'New' },
      });
      const res = mockResponse();
      const next = mockNext();

      await userController.updateUser(req as never, res as never, next);

      expect(userService.updateUser).toHaveBeenCalledWith('1', { firstName: 'New' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
        userData: result.userData,
      });
    });
  });

  describe('deleteUser', () => {
    it('returns 200 and result when delete succeeds', async () => {
      const result = { message: 'User deleted' };
      vi.mocked(userService.deleteUser).mockResolvedValue(result as never);

      const req = mockRequest<{ userId: string }>({ params: { userId: '1' } });
      const res = mockResponse();
      const next = mockNext();

      await userController.deleteUser(req as never, res as never, next);

      expect(userService.deleteUser).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns error status when AppError', async () => {
      vi.mocked(userService.deleteUser).mockRejectedValue(new AppError('User not found', 404));

      const req = mockRequest<{ userId: string }>({ params: { userId: 'missing' } });
      const res = mockResponse();
      const next = mockNext();

      await userController.deleteUser(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('updatePassword', () => {
    it('returns 200 and result when update succeeds', async () => {
      const result = { message: 'Password updated' };
      vi.mocked(userService.updatePassword).mockResolvedValue(result as never);

      const req = mockRequest<object, { password: string; userId: string; oldPassword?: string }>({
        body: { password: 'newPass123', userId: '1', oldPassword: 'oldPass' },
      });
      const res = mockResponse();
      const next = mockNext();

      await userController.updatePassword(req as never, res as never, next);

      expect(userService.updatePassword).toHaveBeenCalledWith('1', 'newPass123', 'oldPass');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns 400 with FAILED status when AppError', async () => {
      vi.mocked(userService.updatePassword).mockRejectedValue(new AppError('Invalid old password', 400));

      const req = mockRequest<object, { password: string; userId: string }>({
        body: { password: 'new', userId: '1' },
      });
      const res = mockResponse();
      const next = mockNext();

      await userController.updatePassword(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'FAILED',
        message: 'Invalid old password',
      });
    });
  });

  describe('updateShipAddress', () => {
    it('returns 200 and result when update succeeds', async () => {
      const result = { message: 'Address updated', data: { id: 'addr-1' } };
      vi.mocked(userService.updateShipAddress).mockResolvedValue(result as never);

      const req = mockRequest<{ userId: string }, { shipAddress: object }>({
        params: { userId: '1' },
        body: { shipAddress: [{ title: 'Home', address: '123 Main St' }] },
      });
      const res = mockResponse();
      const next = mockNext();

      await userController.updateShipAddress(req as never, res as never, next);

      expect(userService.updateShipAddress).toHaveBeenCalledWith('1', {
        shipAddress: [{ title: 'Home', address: '123 Main St' }],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
        data: result.data,
      });
    });
  });

  describe('addExpoPushNotificationToken', () => {
    it('returns 200 and result when add succeeds', async () => {
      const result = { message: 'Token added' };
      vi.mocked(userService.addExpoPushToken).mockResolvedValue(result as never);

      const req = mockRequest<{ userId: string }, { expoPushToken: string }>({
        params: { userId: '1' },
        body: { expoPushToken: 'ExponentPushToken[xxx]' },
      });
      const res = mockResponse();
      const next = mockNext();

      await userController.addExpoPushNotificationToken(req as never, res as never, next);

      expect(userService.addExpoPushToken).toHaveBeenCalledWith('1', 'ExponentPushToken[xxx]');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });
});
