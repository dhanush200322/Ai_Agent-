"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelController = void 0;
class ModelController {
    async listModels(req, res) {
        res.json({ success: true, models: [] });
    }
    async listProviders(req, res) {
        res.json({ success: true, providers: [] });
    }
    async chat(req, res) {
        res.json({ success: true, response: 'chat response' });
    }
    async completion(req, res) {
        res.json({ success: true, response: 'completion response' });
    }
    async stream(req, res) {
        res.json({ success: true, response: 'stream started' });
    }
    async embeddings(req, res) {
        res.json({ success: true, embeddings: [] });
    }
    async image(req, res) {
        res.json({ success: true, url: 'image_url' });
    }
    async audio(req, res) {
        res.json({ success: true, url: 'audio_url' });
    }
    async functionCall(req, res) {
        res.json({ success: true, calls: [] });
    }
    async json(req, res) {
        res.json({ success: true, data: {} });
    }
    async usage(req, res) {
        res.json({ success: true, usage: {} });
    }
    async cost(req, res) {
        res.json({ success: true, cost: 0 });
    }
    async health(req, res) {
        res.json({ success: true, status: 'healthy' });
    }
    async metrics(req, res) {
        res.json({ success: true, metrics: {} });
    }
}
exports.ModelController = ModelController;
