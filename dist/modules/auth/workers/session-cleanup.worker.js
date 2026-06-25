"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionCleanupWorker = void 0;
class SessionCleanupWorker {
    async process(job) {
        // Purge expired sessions from the database
        console.log(`Processing session cleanup task`);
    }
}
exports.SessionCleanupWorker = SessionCleanupWorker;
