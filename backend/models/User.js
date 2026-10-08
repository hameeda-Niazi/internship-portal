import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.'] },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['user', 'employer', 'admin'], default: 'user' },
  company: { type: String, trim: true, maxlength: 120 },
  headline: { type: String, trim: true, maxlength: 160 },
  bio: { type: String, trim: true, maxlength: 2000 },
  location: { type: String, trim: true, maxlength: 120 },
  phone: { type: String, trim: true, maxlength: 30 },
  skills: [{ type: String, trim: true, maxlength: 40 }],
  resumePath: { type: String, select: false },
  resumeStorage: { type: String, enum: ['local', 'cloudinary'], default: 'local', select: false },
  resumePublicId: { type: String, select: false },
  resumeFormat: { type: String, select: false }
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
