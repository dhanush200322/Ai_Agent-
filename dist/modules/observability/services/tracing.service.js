"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracingService = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
class TracingService {
    /**
     * Starts a new span. If context is provided, it acts as a child span.
     */
    startSpan(_module, _operation, parentContext, correlationId) {
        const traceId = parentContext?.traceId || (0, uuid_1.v4)();
        const spanId = (0, uuid_1.v4)();
        return {
            traceId,
            spanId,
            parentSpanId: parentContext?.spanId,
            correlationId: correlationId || parentContext?.correlationId
        };
    }
    /**
     * Ends a span and writes it asynchronously.
     */
    endSpan(context, module, operation, durationMs, status, attributes, events, organizationId) {
        prisma.trace.create({
            data: {
                traceId: context.traceId,
                spanId: context.spanId,
                parentSpanId: context.parentSpanId,
                correlationId: context.correlationId,
                module,
                operation,
                duration: durationMs,
                status,
                attributes: attributes ? JSON.stringify(attributes) : null,
                events: events ? JSON.stringify(events) : null,
                organizationId
            }
        }).catch(err => {
            console.error(`[TracingService] Failed to record span ${context.spanId}:`, err);
        });
    }
}
exports.TracingService = TracingService;
