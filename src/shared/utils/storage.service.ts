import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../../public/uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = crypto.randomUUID();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only standard image formats (jpg, png, webp, gif) are allowed'));
    }
    cb(null, true);
  }
});

export class StorageService {
  static getFileUrl(baseName: string): string {
    // Note: The baseName is now a hash, e.g., 'avatar-abcdef...'
    // The frontend will dynamically append sizes, so we just return the baseName
    return baseName; 
  }
  
  static async deleteFile(baseName: string): Promise<void> {
    try {
      if (!baseName) return;
      
      const fs = require('fs');
      const uploadDir = path.join(__dirname, '../../../public/uploads');
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

      for (const size of sizes) {
        const fullPath = path.join(uploadDir, `${baseName}-${size}.webp`);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    } catch (e) {
      console.error('Failed to delete old files:', e);
    }
  }
}
