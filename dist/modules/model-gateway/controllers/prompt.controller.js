"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptController = void 0;
class PromptController {
    async listPrompts(req, res) {
        res.json({ success: true, prompts: [] });
    }
    async createPrompt(req, res) {
        res.json({ success: true, promptId: 'new_id' });
    }
    async updatePrompt(req, res) {
        res.json({ success: true });
    }
    async deletePrompt(req, res) {
        res.json({ success: true });
    }
    async renderPrompt(req, res) {
        res.json({ success: true, rendered: 'Hello World' });
    }
    async createVersion(req, res) {
        res.json({ success: true, versionId: 'new_version_id' });
    }
}
exports.PromptController = PromptController;
