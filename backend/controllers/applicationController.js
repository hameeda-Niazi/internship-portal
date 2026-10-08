import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import mongoose from 'mongoose';

export async function apply(req, res) {
  if (!mongoose.isValidObjectId(req.params.internshipId)) {
    return res.status(400).json({ message: 'Invalid internship identifier.' });
  }
  const coverLetter = typeof req.body?.coverLetter === 'string' ? req.body.coverLetter.trim() : '';
  if (!coverLetter) return res.status(400).json({ message: 'Please add a short note before submitting your application.' });
  if (coverLetter.length > 5000) return res.status(400).json({ message: 'Your note must be 5,000 characters or fewer.' });

  const internship = await Internship.findById(req.params.internshipId);
  if (!internship || internship.status !== 'active') return res.status(404).json({ message: 'This internship is no longer available.' });
  if (String(internship.postedBy) === String(req.user._id)) return res.status(400).json({ message: 'You cannot apply to your own listing.' });
  if (internship.deadline && internship.deadline < new Date()) return res.status(400).json({ message: 'The application deadline has passed.' });
  const applicant = req.user._id;
  const existing = await Application.findOne({ applicant, internship: internship._id });
  if (existing) return res.status(409).json({ message: 'You have already applied for this internship.' });

  try {
    const application = await Application.create({
      applicant, internship: internship._id, coverLetter
    });
    return res.status(201).json({ message: 'Application submitted successfully.', application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already applied for this internship.' });
    }
    throw error;
  }
}

export async function myApplications(req, res) {
  const items = await Application.find({ applicant: req.user.id }).populate('internship').sort({ createdAt: -1 });
  res.json({ items });
}

export async function applicants(req, res) {
  const internship = await Internship.findById(req.params.internshipId);
  if (!internship) return res.status(404).json({ message: 'Internship not found.' });
  if (req.user.role !== 'admin' && String(internship.postedBy) !== req.user.id) return res.status(403).json({ message: 'You can only view applicants to your listings.' });
  const items = await Application.find({ internship: internship.id }).populate('applicant', 'name email headline bio location phone skills').sort({ createdAt: -1 });
  res.json({ items });
}

export async function allApplications(req, res) {
  const items = await Application.find().populate('applicant', 'name email').populate('internship', 'title company').sort({ createdAt: -1 });
  res.json({ items });
}

export async function updateStatus(req, res) {
  const allowed = ['submitted', 'reviewing', 'interview', 'accepted', 'rejected'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Choose a valid application status.' });
  const application = await Application.findById(req.params.id).populate('internship');
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  if (req.user.role !== 'admin' && String(application.internship.postedBy) !== req.user.id) return res.status(403).json({ message: 'You cannot update this application.' });
  application.status = req.body.status;
  await application.save();
  res.json({ application });
}
