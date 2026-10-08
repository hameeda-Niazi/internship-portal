import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  coverLetter: { type: String, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['submitted', 'reviewing', 'interview', 'accepted', 'rejected'], default: 'submitted' }
}, { timestamps: true });

applicationSchema.index({ applicant: 1, internship: 1 }, { unique: true });
export default mongoose.model('Application', applicationSchema);
