"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotationWorker = void 0;
const rotation_engine_1 = require("../engine/rotation.engine");
class RotationWorker {
    rotationEngine;
    constructor() {
        this.rotationEngine = new rotation_engine_1.RotationEngine();
    }
    async process(job) {
        const { secretId, strategy, metadata } = job.payload.payload;
        await job.log(`Starting rotation for secret ${secretId} via strategy ${strategy}`);
        await this.rotationEngine.executeRotation(secretId, strategy, metadata);
        await job.log(`Rotation completed for secret ${secretId}`);
    }
}
exports.RotationWorker = RotationWorker;
