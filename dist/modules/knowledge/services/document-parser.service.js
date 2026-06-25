"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentParserService = void 0;
const fs_1 = __importDefault(require("fs"));
const pdf_parser_1 = require("../utils/pdf-parser");
const docx_parser_1 = require("../utils/docx-parser");
const AppError_1 = require("../../../shared/errors/AppError");
class DocumentParserService {
    static async parse(filePath, mimeType) {
        switch (mimeType) {
            case 'application/pdf':
                return await pdf_parser_1.PdfParser.parse(filePath, mimeType);
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return await docx_parser_1.DocxParser.parse(filePath, mimeType);
            case 'text/plain':
            case 'text/markdown':
                const text = await fs_1.default.promises.readFile(filePath, 'utf-8');
                const stat = await fs_1.default.promises.stat(filePath);
                return {
                    text,
                    metadata: {
                        pages: 1,
                        fileSize: stat.size,
                        mimeType,
                    }
                };
            default:
                throw new AppError_1.AppError(`Unsupported mime type: ${mimeType}`, 400);
        }
    }
}
exports.DocumentParserService = DocumentParserService;
