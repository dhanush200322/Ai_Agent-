"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
class MetricsService {
    metrics = {};
    startTimes = {};
    globalStartTime = Date.now();
    startTimer(label) {
        this.startTimes[label] = Date.now();
    }
    stopTimer(label) {
        if (this.startTimes[label]) {
            this.metrics[label] = Date.now() - this.startTimes[label];
            delete this.startTimes[label];
        }
    }
    setMetric(label, value) {
        this.metrics[label] = value;
    }
    getMetrics() {
        this.metrics['Total Time'] = Date.now() - this.globalStartTime;
        return this.metrics;
    }
    logMetrics(requestId) {
        const finalMetrics = this.getMetrics();
        console.log(`[${requestId}] [MetricsService] Performance Report:`);
        Object.entries(finalMetrics).forEach(([key, value]) => {
            console.log(`  - ${key}: ${value}${key.includes('Count') ? '' : 'ms'}`);
        });
    }
}
exports.MetricsService = MetricsService;
