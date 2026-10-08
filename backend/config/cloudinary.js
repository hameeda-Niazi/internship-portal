import { v2 as cloudinary } from 'cloudinary';
import { loadEnvironment } from './env.js';

loadEnvironment();

const settings = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};
const configuredValues = Object.values(settings).filter(Boolean).length;

if (configuredValues > 0 && configuredValues < 3) {
  throw new Error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET together.');
}

export const isCloudinaryConfigured = configuredValues === 3;

if (isCloudinaryConfigured) cloudinary.config({ ...settings, secure: true });

export default cloudinary;
