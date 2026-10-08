import SavedInternship from '../models/SavedInternship.js';
import Internship from '../models/Internship.js';

export async function listSaved(req, res) {
  const saved = await SavedInternship.find({ user: req.user.id }).populate({ path: 'internship', populate: { path: 'postedBy', select: 'name company' } }).sort({ createdAt: -1 });
  res.json({ items: saved.filter(item => item.internship).map(item => item.internship) });
}

export async function toggleSaved(req, res) {
  const internship = await Internship.findById(req.params.internshipId);
  if (!internship) return res.status(404).json({ message: 'Internship not found.' });
  const existing = await SavedInternship.findOne({ user: req.user.id, internship: internship.id });
  if (existing) {
    await existing.deleteOne();
    return res.json({ saved: false });
  }
  await SavedInternship.create({ user: req.user.id, internship: internship.id });
  res.status(201).json({ saved: true });
}
