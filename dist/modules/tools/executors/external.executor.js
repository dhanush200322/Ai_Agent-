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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionExecutor = exports.WebhookExecutor = exports.HttpExecutor = void 0;
const base_executor_1 = require("./base.executor");
const vm = __importStar(require("vm"));
class HttpExecutor extends base_executor_1.ToolExecutor {
    async execute(context) {
        const config = context.tool.configuration || {};
        const method = config.method || 'GET';
        // If URL is in args, use it, else from config
        const url = context.args.url || config.baseUrl;
        const headers = config.headers || {};
        const body = context.args.body;
        if (!url) {
            throw new Error('HTTP Executor requires a URL in configuration or arguments.');
        }
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: (method !== 'GET' && method !== 'HEAD' && body) ? JSON.stringify(body) : undefined,
            });
            const text = await response.text();
            return `Status: ${response.status}\nBody: ${text}`;
        }
        catch (error) {
            return `HTTP Request failed: ${error.message}`;
        }
    }
}
exports.HttpExecutor = HttpExecutor;
class WebhookExecutor extends base_executor_1.ToolExecutor {
    async execute(context) {
        const config = context.tool.configuration || {};
        const url = config.webhookUrl;
        const secret = config.secret; // For signing
        const payload = context.args.payload;
        if (!url) {
            throw new Error('Webhook Executor requires a webhookUrl in configuration.');
        }
        // Example simple webhook trigger
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': secret ? 'signed_placeholder' : '' // HMAC signing logic can be added here
                },
                body: JSON.stringify(payload || context.args)
            });
            return `Webhook triggered. Status: ${response.status}`;
        }
        catch (error) {
            return `Webhook execution failed: ${error.message}`;
        }
    }
}
exports.WebhookExecutor = WebhookExecutor;
class FunctionExecutor extends base_executor_1.ToolExecutor {
    async execute(context) {
        const code = context.tool.configuration?.code;
        if (!code) {
            throw new Error('Function Executor requires JavaScript code in configuration.');
        }
        return new Promise((resolve) => {
            try {
                const sandbox = {
                    args: context.args,
                    result: null,
                    console: {
                        log: (..._msgs) => { },
                        error: (..._msgs) => { }
                    }
                };
                const vmContext = vm.createContext(sandbox);
                const script = new vm.Script(`
          (function() {
            try {
              ${code}
            } catch(e) {
              result = { error: e.message };
            }
          })();
        `);
                // Execute with strict timeout to prevent infinite loops
                script.runInContext(vmContext, { timeout: 1000 });
                const res = sandbox.result;
                resolve(typeof res === 'object' ? JSON.stringify(res) : String(res));
            }
            catch (error) {
                resolve(`Function execution error: ${error.message}`);
            }
        });
    }
}
exports.FunctionExecutor = FunctionExecutor;
