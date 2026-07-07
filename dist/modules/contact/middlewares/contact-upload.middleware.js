"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const FORBIDDEN_EXTENSIONS = ['.exe', '.bat', '.cmd', '.ps1', '.sh', '.dll', '.msi', '.vbs'];
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../../../public/uploads/contact');
        try {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        }
        catch (err) {
            cb(err, uploadPath);
        }
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueSuffix = crypto_1.default.randomUUID();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
exports.contactUpload = (0, multer_1.default)({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
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
