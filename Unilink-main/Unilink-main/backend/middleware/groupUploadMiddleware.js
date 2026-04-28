import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    },
});

// Only allow image MIME types
const fileFilter = (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMime.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed'), false);
    }
};

const groupUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/**
 * Handles avatar and banner uploads for groups.
 */
const handleGroupUpload = (req, res, next) => {
    groupUpload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ])(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

export { handleGroupUpload };
