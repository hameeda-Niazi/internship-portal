import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isCloudinaryConfigured } from '../config/cloudinary.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
fs.mkdirSync(root, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (_req, _file, done) => done(null, root),
  filename: (req, file, done) => {
    const ext = path.extname(file.originalname).toLowerCase();
    done(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});

export const resumeUpload = multer({
  storage: isCloudinaryConfigured ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, done) => {
    const valid = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype);
    done(valid ? null : new Error('Resume must be a PDF or Word document.'), valid);
  }
}).single('resume');
