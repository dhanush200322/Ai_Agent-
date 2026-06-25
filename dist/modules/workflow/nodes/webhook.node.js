"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookNode = void 0;
class WebhookNode {
    type = 'webhook';
    async execute(node, context) {
        const url = await context.variables.resolveString(node.config?.url);
        const method = node.config?.method || 'POST';
        const bodyTemplate = node.config?.body || {};
        const headers = node.config?.headers || {};
        if (!url)
            return { status: 'FAILED', error: 'Missing webhook URL' };
        try {
            const resolvedBody = await context.variables.resolveObject(bodyTemplate);
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: method !== 'GET' ? JSON.stringify(resolvedBody) : undefined
            });
            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            }
            catch {
                responseData = responseText;
            }
            if (!response.ok) {
                return { status: 'FAILED', error: `HTTP ${response.status}: ${responseText}` };
            }
            return {
                status: 'COMPLETED',
                output: { status: response.status, data: responseData }
            };
        }
        catch (e) {
            return { status: 'FAILED', error: e.message };
        }
    }
    validate(node) {
        if (!node.config?.url)
            return ['Missing URL'];
        return null;
    }
}
exports.WebhookNode = WebhookNode;
