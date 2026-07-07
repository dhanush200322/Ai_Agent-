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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

export class StorageService {
  static getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
  
  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) return;
      const filename = fileUrl.split('/uploads/')[1];
      if (!filename) return;
      const fs = require('fs');
      const fullPath = path.join(__dirname, '../../../public/uploads', filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (e) {
      console.error('Failed to delete old file:', e);
    }
  }
}
