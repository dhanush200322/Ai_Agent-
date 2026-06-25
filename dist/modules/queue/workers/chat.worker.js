"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatWorker = void 0;
const ChatWorker = async (_job, _context) => {
    await _job.updateProgress(10);
    await _job.log('Chat processing');
    await _job.updateProgress(100);
};
exports.ChatWorker = ChatWorker;
