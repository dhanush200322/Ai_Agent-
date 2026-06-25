"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfParser = void 0;
const fs_1 = __importDefault(require("fs"));
const pdfParse = require('pdf-parse');
class PdfParser {
    static async parse(filePath, mimeType) {
        const dataBuffer = await fs_1.default.promises.readFile(filePath);
        const stat = await fs_1.default.promises.stat(filePath);
        // pdf-parse provides text, numpages, info
        const data = await pdfParse(dataBuffer);
        return {
            text: data.text,
            metadata: {
                pages: data.numpages || 1,
                title: data.info?.Title || undefined,
                fileSize: stat.size,
                mimeType,
            }
        };
    }
}
exports.PdfParser = PdfParser;
