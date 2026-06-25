"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const tokenizer_1 = require("../utils/tokenizer");
class ChunkService {
    chunkSize;
    overlap;
    constructor(chunkSize = 1000, overlap = 200) {
        this.chunkSize = chunkSize;
        this.overlap = overlap;
    }
    chunkText(text) {
        if (!text)
            return [];
        const chunks = [];
        let start = 0;
        let index = 0;
        while (start < text.length) {
            let end = start + this.chunkSize;
            // Don't chunk in the middle of a word if possible
            if (end < text.length) {
                const nextSpace = text.indexOf(' ', end);
                const prevSpace = text.lastIndexOf(' ', end);
                // Prefer breaking at the nearest space before the end, if within a reasonable window (e.g. 50 chars)
                if (prevSpace !== -1 && end - prevSpace < 50) {
                    end = prevSpace;
                }
                else if (nextSpace !== -1 && nextSpace - end < 50) {
                    end = nextSpace;
                }
            }
            const content = text.slice(start, end).trim();
            if (content.length > 0) {
                chunks.push({
                    id: crypto_1.default.randomUUID(),
                    index,
                    content,
                    start,
                    end,
                    tokenCount: tokenizer_1.Tokenizer.estimateTokenCount(content)
                });
                index++;
            }
            start = end - this.overlap;
            if (start < 0)
                start = 0;
            // Prevent infinite loop if overlap is somehow >= advance
            if (end <= start) {
                start = end + 1;
            }
        }
        return chunks;
    }
}
exports.ChunkService = ChunkService;
