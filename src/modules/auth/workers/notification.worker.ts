export class NotificationWorker {
  async process(job: any): Promise<void> {
    const { userId, type, payload } = job.data;
    // Send notifications like 'New login from unknown device'
    console.log(`Processing notification for user ${userId}: ${type}`);
  }
}
