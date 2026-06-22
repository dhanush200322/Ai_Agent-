import fs from 'fs';
import { PdfParser, ParsedDocument } from '../utils/pdf-parser';
import { DocxParser } from '../utils/docx-parser';
import { AppError } from '../../../shared/errors/AppError';

export class DocumentParserService {
  static async parse(filePath: string, mimeType: string): Promise<ParsedDocument> {
    switch (mimeType) {
      case 'application/pdf':
        return await PdfParser.parse(filePath, mimeType);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await DocxParser.parse(filePath, mimeType);
      
      case 'text/plain':
      case 'text/markdown':
        const text = await fs.promises.readFile(filePath, 'utf-8');
        const stat = await fs.promises.stat(filePath);
        return {
          text,
          metadata: {
            pages: 1,
            fileSize: stat.size,
            mimeType,
          }
        };

      default:
        throw new AppError(`Unsupported mime type: ${mimeType}`, 400);
    }
  }
}
