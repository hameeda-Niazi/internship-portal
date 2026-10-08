import User from '../models/User.js';
import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import SavedInternship from '../models/SavedInternship.js';
import { publicUser } from '../utils/token.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

export async function updateProfile(req, res) {
  const fields = ['name', 'headline', 'bio', 'location', 'phone', 'skills', 'company'];
  for (const field of fields) if (req.body[field] !== undefined) req.user[field] = req.body[field];
  await req.user.save();
  res.json({ user: publicUser(req.user) });
}

export async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Choose a PDF or Word resume to upload.' });
  const user = await User.findById(req.user.id).select('+resumePath +resumePublicId +resumeStorage +resumeFormat');
  const signature = req.file.buffer || await fs.readFile(req.file.path);
  if (!isValidResume(signature, req.file.mimetype)) {
    if (req.file.path) await fs.unlink(req.file.path);
    return res.status(400).json({ message: 'The file contents do not match a supported PDF or Word document.' });
  }

  let uploadedAsset;
  if (isCloudinaryConfigured) {
    uploadedAsset = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        resource_type: 'raw',
        type: 'authenticated',
        public_id: `${user.id}/${Date.now()}-${safeBaseName(req.file.originalname)}${path.extname(req.file.originalname).toLowerCase()}`,
        overwrite: false
      }, (error, result) => error ? reject(error) : resolve(result));
      stream.end(req.file.buffer);
    });
  }

  const previous = { path: user.resumePath, publicId: user.resumePublicId, storage: user.resumeStorage };
  user.resumeStorage = isCloudinaryConfigured ? 'cloudinary' : 'local';
  user.resumePath = isCloudinaryConfigured ? undefined : req.file.path;
  user.resumePublicId = uploadedAsset?.public_id;
  user.resumeFormat = uploadedAsset?.format || (req.file.path ? path.extname(req.file.originalname).slice(1).toLowerCase() : undefined);
  try {
  await user.save();
  } catch (error) {
  if (req.file.path) await fs.unlink(req.file.path).catch(cleanupError => {
    if (cleanupError.code !== 'ENOENT') console.error('Unable to remove failed resume upload:', cleanupError);
  });
  if (uploadedAsset) await cloudinary.uploader.destroy(uploadedAsset.public_id, {
    resource_type: 'raw',
    type: 'authenticated'
  }).catch(cleanupError => console.error('Unable to remove failed Cloudinary resume upload:', cleanupError));
  throw error;
  }

  if (previous.storage === 'cloudinary' && previous.publicId) {
    await cloudinary.uploader.destroy(previous.publicId, { resource_type: 'raw', type: 'authenticated' });
  } else if (previous.path && previous.path !== user.resumePath) {
    await fs.unlink(previous.path).catch(error => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
  res.json({ user: publicUser(user), message: 'Resume uploaded successfully.' });
}

export async function downloadResume(req, res) {
  const user = await User.findById(req.params.id).select('+resumePath +resumePublicId +resumeStorage +resumeFormat');
  if (!user || (!user.resumePath && !user.resumePublicId)) return res.status(404).json({ message: 'Resume not found.' });
  const ownsOrAdmin = req.user.role === 'admin' || req.user.id === user.id;
  if (!ownsOrAdmin) {
    const applications = await Application.find({ applicant: user.id }).populate('internship', 'postedBy');
    const isApplicantEmployer = applications.some(application =>
      application.internship && String(application.internship.postedBy) === req.user.id
    );
    if (!isApplicantEmployer) {
      return res.status(403).json({ message: 'You are not allowed to access this resume.' });
    }
  }
  if (user.resumeStorage === 'cloudinary') {
    if (!isCloudinaryConfigured || !user.resumePublicId) return res.status(500).json({ message: 'Resume storage is not configured correctly.' });
    const url = cloudinary.utils.private_download_url(user.resumePublicId, user.resumeFormat, {
      resource_type: 'raw',
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + 300
    });
    return res.redirect(302, url);
  }
  const uploads = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
  if (path.dirname(path.resolve(user.resumePath)) !== uploads) return res.status(400).json({ message: 'Invalid resume location.' });
  res.download(user.resumePath);
}

function safeBaseName(filename) {
  return path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80) || 'resume';
}

function isValidResume(buffer, mimeType) {
  const pdf = mimeType === 'application/pdf' && buffer.subarray(0, 5).toString() === '%PDF-';
  const doc = mimeType === 'application/msword' &&
    buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  const docx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
    buffer.subarray(0, 2).toString() === 'PK';
  return pdf || doc || docx;
}

export async function listUsers(req, res) {
  const users = await User.find({ role: { $in: ['user', 'employer'] } }).sort({ createdAt: -1 });
  res.json({ items: users.map(publicUser) });
}

export async function deleteUser(req, res) {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own account.' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const listings = await Internship.find({ postedBy: user.id }).select('_id');
  const listingIds = listings.map(item => item.id);
  await Promise.all([
    user.deleteOne(),
    Application.deleteMany({ applicant: user.id }),
    SavedInternship.deleteMany({ user: user.id }),
    Application.deleteMany({ internship: { $in: listingIds } }),
    SavedInternship.deleteMany({ internship: { $in: listingIds } }),
    Internship.deleteMany({ postedBy: user.id })
  ]);
  res.status(204).end();
}
