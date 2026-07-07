"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = exports.AVATAR_SIZES = void 0;
const sharp_1 = __importDefault(require("sharp"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
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
            // Calculate SHA256 Hash
            const hash = crypto_1.default.createHash('sha256').update(fileBuffer).digest('hex');
            const baseName = `avatar-${hash}`;
            const uploadDir = path_1.default.join(__dirname, '../../../public/uploads');
            // Check if this image was already processed (duplicate detection)
            const testVariantPath = path_1.default.join(uploadDir, `${baseName}-xs.webp`);
            if (fs_1.default.existsSync(testVariantPath)) {
                // If one variant exists, we assume all exist and we can just return the baseName
                // Finally, delete the uploaded original file since we're using the cached one
                await fs_1.default.promises.unlink(inputPath).catch(() => { });
                return baseName;
            }
            // Process image using sharp
            const image = (0, sharp_1.default)(fileBuffer);
            // Validate dimensions
            const metadata = await image.metadata();
            if ((metadata.width || 0) < 128 || (metadata.height || 0) < 128) {
                await fs_1.default.promises.unlink(inputPath).catch(() => { });
                throw new Error('Image must be at least 128x128 pixels');
            }
            // Strip metadata, auto-rotate using EXIF, and convert to WebP
            // Note: clone() is used so we can generate multiple sizes from the same base image
            const baseProcessor = image.rotate().webp({ quality: 80 });
            // Generate all sizes
            const promises = Object.entries(exports.AVATAR_SIZES).map(async ([sizeKey, sizeValue]) => {
                const outputPath = path_1.default.join(uploadDir, `${baseName}-${sizeKey}.webp`);
                await baseProcessor
                    .clone()
                    .resize({
                    width: sizeValue,
                    height: sizeValue,
                    fit: 'cover',
                    position: 'attention', // Falls back to center if no face/attention point
                })
                    .toFile(outputPath);
            });
            await Promise.all(promises);
            // Delete the original uploaded file
            await fs_1.default.promises.unlink(inputPath).catch(() => { });
            return baseName;
        }
        catch (error) {
            console.error('Image processing failed:', error);
            throw new Error('Failed to process image');
        }
    }
}
exports.ImageService = ImageService;
