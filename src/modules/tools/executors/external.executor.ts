import { ToolExecutor, ExecutorContext } from './base.executor';
import * as vm from 'vm';

export class HttpExecutor extends ToolExecutor {
  async execute(context: ExecutorContext): Promise<string> {
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
    } catch (error: any) {
      return `HTTP Request failed: ${error.message}`;
    }
  }
}

export class WebhookExecutor extends ToolExecutor {
  async execute(context: ExecutorContext): Promise<string> {
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
    } catch (error: any) {
      return `Webhook execution failed: ${error.message}`;
    }
  }
}

export class FunctionExecutor extends ToolExecutor {
  async execute(context: ExecutorContext): Promise<string> {
    const code = context.tool.configuration?.code;
    if (!code) {
      throw new Error('Function Executor requires JavaScript code in configuration.');
    }

    return new Promise((resolve) => {
      try {
        const sandbox = {
          args: context.args,
          result: null as any,
          console: {
            log: (..._msgs: any[]) => {},
            error: (..._msgs: any[]) => {}
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
      } catch (error: any) {
        resolve(`Function execution error: ${error.message}`);
      }
    });
  }
}
