export class SessionCleanupWorker {
  async process(job: any): Promise<void> {
    // Purge expired sessions from the database
    console.log(`Processing session cleanup task`);
  }
}
