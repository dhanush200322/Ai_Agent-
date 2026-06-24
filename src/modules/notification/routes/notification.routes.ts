import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../../../middleware/auth';
import { checkNotificationQuota } from '../middleware/notification-quota.middleware';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();
const controller = new NotificationController();

router.post('/send', authenticate, checkNotificationQuota, asyncHandler(controller.send.bind(controller)));
router.post('/email', authenticate, checkNotificationQuota, asyncHandler(controller.sendEmail.bind(controller)));
router.post('/sms', authenticate, checkNotificationQuota, asyncHandler(controller.sendSMS.bind(controller)));
router.post('/push', authenticate, checkNotificationQuota, asyncHandler(controller.sendPush.bind(controller)));
router.post('/webhook', authenticate, checkNotificationQuota, asyncHandler(controller.sendWebhook.bind(controller)));

router.get('/', authenticate, asyncHandler(controller.getNotifications.bind(controller)));
router.get('/templates', authenticate, asyncHandler(controller.getTemplates.bind(controller)));
router.get('/preferences', authenticate, asyncHandler(controller.getPreferences.bind(controller)));

router.get('/:id', authenticate, asyncHandler(controller.getNotificationById.bind(controller)));
router.put('/:id/read', authenticate, asyncHandler(controller.markAsRead.bind(controller)));
router.put('/:id/unread', authenticate, asyncHandler(controller.markAsUnread.bind(controller)));
router.put('/:id/archive', authenticate, asyncHandler(controller.archive.bind(controller)));
router.delete('/:id', authenticate, asyncHandler(controller.deleteNotification.bind(controller)));

router.post('/templates', authenticate, asyncHandler(controller.createTemplate.bind(controller)));
router.put('/templates/:id', authenticate, asyncHandler(controller.updateTemplate.bind(controller)));
router.delete('/templates/:id', authenticate, asyncHandler(controller.deleteTemplate.bind(controller)));

router.put('/preferences', authenticate, asyncHandler(controller.updatePreferences.bind(controller)));

export default router;
