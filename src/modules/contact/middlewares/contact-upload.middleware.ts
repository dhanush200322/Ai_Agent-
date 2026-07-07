import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const FORBIDDEN_EXTENSIONS = ['.exe', '.bat', '.cmd', '.ps1', '.sh', '.dll', '.msi', '.vbs'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../../public/uploads/contact');
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err: any) {
      cb(err, uploadPath);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = crypto.randomUUID();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

export const contactUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Check forbidden extensions
    if (FORBIDDEN_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Dangerous file extension detected: ${ext}`));
    }
    
    // Reject empty file names
    if (!file.originalname || file.originalname.trim() === '') {
        return cb(new Error('File name cannot be empty.'));
    }

    // You can add stricter MIME checking here if needed, 
    // but the prompt asked for basic security and forbidden ext blocking.
    cb(null, true);
  }
});
