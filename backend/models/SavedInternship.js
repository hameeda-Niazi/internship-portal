import mongoose from 'mongoose';

const savedInternshipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true }
}, { timestamps: true });

savedInternshipSchema.index({ user: 1, internship: 1 }, { unique: true });
export default mongoose.model('SavedInternship', savedInternshipSchema);
