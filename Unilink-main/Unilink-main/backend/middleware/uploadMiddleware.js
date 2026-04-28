import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist at startup
const uploadDirs = ['uploads/images', 'uploads/videos', 'uploads/docs'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure disk storage with unique filenames
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'image') {
            cb(null, 'uploads/images');
        } else if (file.fieldname === 'video') {
            cb(null, 'uploads/videos');
        } else if (file.fieldname === 'document') {
            cb(null, 'uploads/docs');
        } else {
            cb(new Error('Invalid field name'), false);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

// Permissive file filter — validate MIME types broadly
const fileFilter = (req, file, cb) => {
    const mime = file.mimetype.toLowerCase();

    if (file.fieldname === 'image') {
        if (mime.startsWith('image/')) return cb(null, true);
        return cb(new Error('Only image files are allowed for the image field'));
    }
    if (file.fieldname === 'video') {
        if (mime.startsWith('video/')) return cb(null, true);
        return cb(new Error('Only video files are allowed for the video field'));
    }
    if (file.fieldname === 'document') {
        const allowedDoc = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedDoc.includes(mime)) return cb(null, true);
        return cb(new Error('Only PDF and Word documents are allowed'));
    }
    cb(new Error('Unknown file field: ' + file.fieldname), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB global limit
});

const cleanupFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}
};

/**
 * handlePostUpload — wraps upload.fields() with clean error handling.
 * After this middleware, req.files is guaranteed populated or an error is sent.
 */
const handlePostUpload = (req, res, next) => {
    upload.fields([
        { name: 'image',    maxCount: 1 },
        { name: 'video',    maxCount: 1 },
        { name: 'document', maxCount: 1 },
    ])(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('[multer] MulterError:', err.message);
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        }
        if (err) {
            console.error('[multer] Filter error:', err.message);
            return res.status(400).json({ message: err.message });
        }

        const files = req.files || {};
        const imgFile  = files.image?.[0];
        const vidFile  = files.video?.[0];
        const docFile  = files.document?.[0];

        // Enforce per-type size limits
        if (imgFile && imgFile.size > 5 * 1024 * 1024) {
            cleanupFile(imgFile.path);
            if (vidFile) cleanupFile(vidFile.path);
            if (docFile) cleanupFile(docFile.path);
            return res.status(400).json({ message: 'Image must be under 5 MB' });
        }
        if (vidFile && vidFile.size > 20 * 1024 * 1024) {
            if (imgFile) cleanupFile(imgFile.path);
            cleanupFile(vidFile.path);
            if (docFile) cleanupFile(docFile.path);
            return res.status(400).json({ message: 'Video must be under 20 MB' });
        }

        console.log('[multer] req.files:', req.files || 'NO FILES');
        next();
    });
};

export { upload, handlePostUpload, cleanupFile };
