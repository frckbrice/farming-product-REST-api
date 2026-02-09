import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockRequest, mockResponse, mockNext } from '../utils/testHelpers';
import * as notificationController from '../../src/controllers/notification.controller';
import * as notificationService from '../../src/services/notification.service';
import { AppError } from '../../src/errors';

vi.mock('../../src/services/notification.service');

describe('notification.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNotification', () => {
    it('returns 200 and notifications when service succeeds', async () => {
      const notifications = { count: 1, rows: [{ id: 'n1', title: 'T', message: 'M' }] };
      vi.mocked(notificationService.getNotificationsByUserId).mockResolvedValue(notifications as never);

      const req = mockRequest<{ userId: string }>({ params: { userId: 'u1' } });
      const res = mockResponse();
      const next = mockNext();

      await notificationController.getNotification(req as never, res as never, next);

      expect(notificationService.getNotificationsByUserId).toHaveBeenCalledWith('u1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ notifications });
    });
  });

  describe('createNotification', () => {
    it('returns 200 and result when created', async () => {
      const notification = { id: 'n1', userId: 'u1', title: 'Hi', message: 'Hello' };
      vi.mocked(notificationService.createNotification).mockResolvedValue(notification as never);

      const req = mockRequest<{ userId: string }, { title: string; message: string }>({
        params: { userId: 'u1' },
        body: { title: 'Hi', message: 'Hello' },
      });
      const res = mockResponse();
      const next = mockNext();

      await notificationController.createNotification(req as never, res as never, next);

      expect(notificationService.createNotification).toHaveBeenCalledWith('u1', {
        title: 'Hi',
        message: 'Hello',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: notification });
    });

    it('returns 400 when AppError', async () => {
      vi.mocked(notificationService.createNotification).mockRejectedValue(
        new AppError('Title and message are required', 400),
      );

      const req = mockRequest<{ userId: string }, { title: string; message: string }>({
        params: { userId: 'u1' },
        body: { title: '', message: '' },
      });
      const res = mockResponse();
      const next = mockNext();

      await notificationController.createNotification(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Title and message are required' });
    });
  });

  describe('markAsRead', () => {
    it('returns 200 and result when marked', async () => {
      const result = { message: 'Marked as read' };
      vi.mocked(notificationService.markNotificationAsRead).mockResolvedValue(result as never);

      const req = mockRequest<{ id: string }>({ params: { id: 'n1' } });
      const res = mockResponse();
      const next = mockNext();

      await notificationController.markAsRead(req as never, res as never, next);

      expect(notificationService.markNotificationAsRead).toHaveBeenCalledWith('n1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns 404 when AppError', async () => {
      vi.mocked(notificationService.markNotificationAsRead).mockRejectedValue(
        new AppError('Notification not found', 404),
      );

      const req = mockRequest<{ id: string }>({ params: { id: 'missing' } });
      const res = mockResponse();
      const next = mockNext();

      await notificationController.markAsRead(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Notification not found' });
    });
  });

  describe('testExpoNotification', () => {
    it('returns 200 and result when sent', async () => {
      const result = { message: 'Test notification sent' };
      vi.mocked(notificationService.sendTestExpoNotification).mockResolvedValue(result as never);

      const req = mockRequest<{ userId: string }>({ params: { userId: 'u1' } });
      const res = mockResponse();
      const next = mockNext();

      await notificationController.testExpoNotification(req as never, res as never, next);

      expect(notificationService.sendTestExpoNotification).toHaveBeenCalledWith('u1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns error status when AppError', async () => {
      vi.mocked(notificationService.sendTestExpoNotification).mockRejectedValue(
        new AppError('User not found', 404),
      );

      const req = mockRequest<{ userId: string }>({ params: { userId: 'missing' } });
      const res = mockResponse();
      const next = mockNext();

      await notificationController.testExpoNotification(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });
});
