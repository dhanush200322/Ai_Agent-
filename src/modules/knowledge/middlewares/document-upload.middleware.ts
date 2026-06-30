import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

import fs from 'fs';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown'
];

const documentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Reusing the same public/uploads directory as the existing StorageService
    const uploadPath = path.join(__dirname, '../../../../public/uploads/documents');
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err: any) {
      cb(err, uploadPath);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = crypto.randomUUID();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

export const documentUpload = multer({ 
  storage: documentStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    console.log("[DEBUG multer fileFilter] req.file =", req.file);
    console.log("[DEBUG multer fileFilter] req.body =", req.body);
    console.log("[DEBUG multer fileFilter] req.params =", req.params);
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only PDF, DOCX, TXT, and Markdown files are allowed.'));
    }
    cb(null, true);
  }
});
