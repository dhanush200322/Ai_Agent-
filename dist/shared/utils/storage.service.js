"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../../public/uploads'));
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueSuffix = crypto_1.default.randomUUID();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
exports.upload = (0, multer_1.default)({
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
class StorageService {
    static getFileUrl(baseName) {
        // Note: The baseName is now a hash, e.g., 'avatar-abcdef...'
        // The frontend will dynamically append sizes, so we just return the baseName
        return baseName;
    }
    static async deleteFile(baseName) {
        try {
            if (!baseName)
                return;
            const fs = require('fs');
            const uploadDir = path_1.default.join(__dirname, '../../../public/uploads');
            const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
            for (const size of sizes) {
                const fullPath = path_1.default.join(uploadDir, `${baseName}-${size}.webp`);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        }
        catch (e) {
            console.error('Failed to delete old files:', e);
        }
    }
}
exports.StorageService = StorageService;
