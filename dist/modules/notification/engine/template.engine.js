"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEngine = void 0;
class TemplateEngine {
    render(content, context) {
        let rendered = content;
        for (const [key, value] of Object.entries(context)) {
            const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            rendered = rendered.replace(placeholder, String(value ?? ''));
        }
        return rendered;
    }
    renderSubject(subject, context) {
        if (!subject)
            return '';
        return this.render(subject, context);
    }
    applyBranding(body, type, brandingConfig = {}) {
        if (type !== 'HTML') {
            return body;
        }
        const logo = brandingConfig.logoUrl ? `<img src="${brandingConfig.logoUrl}" alt="Logo" style="max-height: 50px; margin-bottom: 20px;" />` : '';
        const color = brandingConfig.primaryColor || '#4F46E5';
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; border-top: 4px solid ${color}; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          ${logo}
          <div class="content">
            ${body}
          </div>
          <div class="footer">
            Sent by Enterprise Notification Platform.
          </div>
        </div>
      </body>
      </html>
    `.trim();
    }
}
exports.TemplateEngine = TemplateEngine;
