"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueController = void 0;
class QueueController {
    static async health(_req, res) {
        res.json({ status: 'healthy', redis: 'connected', workers: [], dlq: 0 });
    }
}
exports.QueueController = QueueController;
