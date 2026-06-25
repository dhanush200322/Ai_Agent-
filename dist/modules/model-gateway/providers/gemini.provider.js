"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const base_provider_1 = require("./base.provider");
class GeminiProvider extends base_provider_1.BaseProvider {
    name = 'gemini';
    async initialize(config) { }
    async chatCompletion(request) { return {}; }
    async *chatCompletionStream(request) { }
    async generateEmbeddings(text, model) { return []; }
    async isHealthy() { return true; }
}
exports.GeminiProvider = GeminiProvider;
