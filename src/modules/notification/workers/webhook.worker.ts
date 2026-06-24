import { DeliveryEngine } from '../engine/delivery.engine';
import { QueueJob } from '../../queue/providers/queue-provider.interface';

const deliveryEngine = new DeliveryEngine();

export class WebhookWorker {
  async process(job: QueueJob): Promise<void> {
    const notificationId = job.payload?.payload?.notificationId;
    if (notificationId) {
      await deliveryEngine.deliver(notificationId);
    }
  }
}
