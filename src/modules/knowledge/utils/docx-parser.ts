import fs from 'fs';
import * as mammoth from 'mammoth';
import { ParsedDocument } from './pdf-parser';

export class DocxParser {
  static async parse(filePath: string, mimeType: string): Promise<ParsedDocument> {
    const stat = await fs.promises.stat(filePath);
    
    // mammoth extracts raw text, preserving paragraphs roughly as newlines
    const result = await mammoth.extractRawText({ path: filePath });
    
    return {
      text: result.value,
      metadata: {
        pages: 1, // DOCX raw extraction doesn't provide accurate page count
        fileSize: stat.size,
        mimeType,
      }
    };
  }
}
