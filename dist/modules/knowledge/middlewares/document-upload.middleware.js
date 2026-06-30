"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
];
const documentStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        // Reusing the same public/uploads directory as the existing StorageService
        const uploadPath = path_1.default.join(__dirname, '../../../../public/uploads/documents');
        try {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        }
        catch (err) {
            cb(err, uploadPath);
        }
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueSuffix = crypto_1.default.randomUUID();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
exports.documentUpload = (0, multer_1.default)({
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
