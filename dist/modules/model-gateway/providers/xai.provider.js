"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XaiProvider = void 0;
const base_provider_1 = require("./base.provider");
class XaiProvider extends base_provider_1.BaseProvider {
    name = 'xai';
    async initialize(config) { }
    async chatCompletion(request) { return {}; }
    async *chatCompletionStream(request) { }
    async generateEmbeddings(text, model) { return []; }
    async isHealthy() { return true; }
}
exports.XaiProvider = XaiProvider;
