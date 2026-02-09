import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockModels } from '../mocks/sequelize';
import * as notificationService from '../../src/services/notification.service';

describe('notification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModels.Notification.findAndCountAll.mockResolvedValue({
      count: 0,
      rows: [],
    });
    mockModels.Notification.create.mockImplementation((data: object) =>
      Promise.resolve({ ...data, id: 'notif-id' }),
    );
    mockModels.Notification.update.mockResolvedValue([1]);
  });

  describe('getNotificationsByUserId', () => {
    it('returns findAndCountAll result', async () => {
      const rows = [{ id: '1', title: 'T', message: 'M', userId: 'u1' }];
      mockModels.Notification.findAndCountAll.mockResolvedValue({
        count: 1,
        rows,
      });

      const result = await notificationService.getNotificationsByUserId('u1');
      expect(result.count).toBe(1);
      expect(result.rows).toEqual(rows);
    });
  });

  describe('createNotification', () => {
    it('throws AppError when title or message missing', async () => {
      await expect(
        notificationService.createNotification('u1', {
          title: '',
          message: 'M',
        }),
      ).rejects.toMatchObject({
        message: 'Title and message are required',
        statusCode: 400,
      });

      await expect(
        notificationService.createNotification('u1', {
          title: 'T',
          message: '',
        }),
      ).rejects.toMatchObject({
        message: 'Title and message are required',
        statusCode: 400,
      });
    });

    it('creates and returns notification', async () => {
      const created = {
        id: 'n1',
        userId: 'u1',
        title: 'Hi',
        message: 'Body',
      };
      mockModels.Notification.create.mockResolvedValue(created);

      const result = await notificationService.createNotification('u1', {
        title: 'Hi',
        message: 'Body',
      });
      expect(result).toEqual(created);
    });

    it('throws AppError when create returns null', async () => {
      mockModels.Notification.create.mockResolvedValue(null);

      await expect(
        notificationService.createNotification('u1', {
          title: 'T',
          message: 'M',
        }),
      ).rejects.toMatchObject({
        message: 'Failed to create notification',
        statusCode: 500,
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('throws AppError when notification not found', async () => {
      mockModels.Notification.update.mockResolvedValue([0]);

      await expect(
        notificationService.markNotificationAsRead('missing-id'),
      ).rejects.toMatchObject({
        message: 'Notification not found',
        statusCode: 404,
      });
    });

    it('returns success message when updated', async () => {
      mockModels.Notification.update.mockResolvedValue([1]);

      const result = await notificationService.markNotificationAsRead('n1');
      expect(result).toEqual({
        message: 'Notification marked as read',
      });
    });
  });
});
