import fs from 'fs';
const pdfParse = require('pdf-parse');

export interface ParsedDocument {
  text: string;
  metadata: {
    pages: number;
    title?: string;
    fileSize: number;
    mimeType: string;
    [key: string]: any;
  };
}

export class PdfParser {
  static async parse(filePath: string, mimeType: string): Promise<ParsedDocument> {
    const dataBuffer = await fs.promises.readFile(filePath);
    const stat = await fs.promises.stat(filePath);
    
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
