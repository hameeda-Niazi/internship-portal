import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  type: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], required: true },
  duration: { type: String, required: true, trim: true, maxlength: 60 },
  stipend: { type: String, default: 'Unpaid', trim: true, maxlength: 80 },
  description: { type: String, required: true, trim: true, maxlength: 10000 },
  requirements: [{ type: String, trim: true, maxlength: 300 }],
  skills: [{ type: String, trim: true, maxlength: 40 }],
  deadline: { type: Date },
  companyWebsite: { type: String, trim: true, maxlength: 300 },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

internshipSchema.index({ title: 'text', company: 'text', description: 'text', category: 'text' });
export default mongoose.model('Internship', internshipSchema);
