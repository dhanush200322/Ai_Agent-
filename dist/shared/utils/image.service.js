"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = exports.AVATAR_SIZES = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
exports.AVATAR_SIZES = {
    xs: 48,
    sm: 64,
    md: 96,
    lg: 128,
    xl: 256,
    '2xl': 512,
};
class ImageService {
    static async processAvatar(inputPath) {
        try {
            const fileBuffer = await fs_1.default.promises.readFile(inputPath);
            // Process image using sharp
            const image = (0, sharp_1.default)(fileBuffer);
            // Validate dimensions
            const metadata = await image.metadata();
            if ((metadata.width || 0) < 128 || (metadata.height || 0) < 128) {
                await fs_1.default.promises.unlink(inputPath).catch(() => { });
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
            await fs_1.default.promises.unlink(inputPath).catch(() => { });
            // Return the base64 string directly
            return `data:image/webp;base64,${processedBuffer.toString('base64')}`;
        }
        catch (error) {
            console.error('Image processing failed:', error);
            throw new Error('Failed to process image');
        }
    }
}
exports.ImageService = ImageService;
