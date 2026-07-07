import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export const AVATAR_SIZES = {
  xs: 48,
  sm: 64,
  md: 96,
  lg: 128,
  xl: 256,
  '2xl': 512,
};

export class ImageService {
  static async processAvatar(inputPath: string): Promise<string> {
    try {
      const fileBuffer = await fs.promises.readFile(inputPath);
      
      // Process image using sharp
      const image = sharp(fileBuffer);
      
      // Validate dimensions
      const metadata = await image.metadata();
      if ((metadata.width || 0) < 128 || (metadata.height || 0) < 128) {
        await fs.promises.unlink(inputPath).catch(() => {});
        throw new Error('Image must be at least 128x128 pixels');
      }

      // Strip metadata, auto-rotate, resize, and convert to WebP
      const processedBuffer = await image
        .rotate()
        .resize({
          width: 256,
          height: 256,
          fit: 'cover',
          position: 'attention',
        })
        .webp({ quality: 80 })
        .toBuffer();

      // Delete the original uploaded file
      await fs.promises.unlink(inputPath).catch(() => {});

      // Return the base64 string directly
      return `data:image/webp;base64,${processedBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Image processing failed:', error);
      throw new Error('Failed to process image');
    }
  }
}
