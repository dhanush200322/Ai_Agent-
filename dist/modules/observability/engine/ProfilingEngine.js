"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProfilingEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilingEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const common_1 = require("@nestjs/common");
const v8 = __importStar(require("v8"));
const perfHooks = __importStar(require("perf_hooks"));
const MetricsEngine_1 = require("./MetricsEngine");
let ProfilingEngine = ProfilingEngine_1 = class ProfilingEngine {
    metrics;
    logger = new common_1.Logger(ProfilingEngine_1.name);
    prisma = prisma_1.prisma;
    constructor(metrics) {
        this.metrics = metrics;
        this.monitorEventLoop();
        this.monitorGC();
    }
    monitorEventLoop() {
        const histogram = perfHooks.monitorEventLoopDelay({ resolution: 10 });
        histogram.enable();
        setInterval(() => {
            const delay = histogram.mean / 1e6; // Convert to ms
            this.metrics.setGauge('nodejs_eventloop_delay_ms', {}, delay);
            if (delay > 100) {
                this.logger.warn(`High Event Loop Delay: ${delay.toFixed(2)}ms`);
                this.saveProfile('EVENT_LOOP', { meanDelayMs: delay });
            }
        }, 5000);
    }
    monitorGC() {
        const obs = new perfHooks.PerformanceObserver((list) => {
            const entry = list.getEntries()[0];
            const kind = entry.detail ? entry.detail.kind : 0;
            this.metrics.observeHistogram('nodejs_gc_duration_seconds', { kind }, entry.duration / 1000);
        });
        obs.observe({ entryTypes: ['gc'] });
    }
    async captureHeapSnapshot() {
        const stats = v8.getHeapStatistics();
        this.metrics.setGauge('nodejs_heap_used_bytes', {}, stats.used_heap_size);
        this.metrics.setGauge('nodejs_heap_total_bytes', {}, stats.total_heap_size);
        await this.saveProfile('MEMORY', stats);
    }
    async checkForMemoryLeaks() {
        const stats = v8.getHeapStatistics();
        const usageRatio = stats.used_heap_size / stats.heap_size_limit;
        if (usageRatio > 0.85) {
            this.logger.error(`Possible memory leak detected. Heap usage at ${(usageRatio * 100).toFixed(1)}%`);
            await this.saveProfile('MEMORY_LEAK_WARNING', stats);
        }
    }
    async saveProfile(type, data) {
        await this.prisma.performanceProfile.create({
            data: {
                type,
                snapshotData: JSON.stringify(data)
            }
        });
    }
};
exports.ProfilingEngine = ProfilingEngine;
exports.ProfilingEngine = ProfilingEngine = ProfilingEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricsEngine_1.MetricsEngine])
], ProfilingEngine);
