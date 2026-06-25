"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqProvider = void 0;
const base_provider_1 = require("./base.provider");
class GroqProvider extends base_provider_1.BaseProvider {
    name = 'groq';
    async initialize(config) { }
    async chatCompletion(request) { return {}; }
    async *chatCompletionStream(request) { }
    async generateEmbeddings(text, model) { return []; }
    async isHealthy() { return true; }
}
exports.GroqProvider = GroqProvider;
