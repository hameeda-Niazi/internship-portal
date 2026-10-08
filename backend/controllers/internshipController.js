import Internship from '../models/Internship.js';
import SavedInternship from '../models/SavedInternship.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

const writableFields = [
  'title', 'company', 'category', 'location', 'type', 'duration', 'stipend',
  'description', 'requirements', 'skills', 'deadline', 'companyWebsite', 'status'
];

function pickWritableFields(body) {
  return Object.fromEntries(writableFields
    .filter(field => Object.hasOwn(body, field))
    .map(field => [field, body[field]]));
}

function permitted(req, internship) {
  return req.user.role === 'admin' || String(internship.postedBy) === req.user.id;
}

export async function listInternships(req, res) {
  const { q, category, location, duration, type, sort = 'newest', page = 1, limit = 12 } = req.query;
  const filter = { status: 'active' };
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  if (location) filter.location = new RegExp(escapeRegex(location), 'i');
  if (duration) filter.duration = new RegExp(escapeRegex(duration), 'i');
  if (type) filter.type = type;
  if (q) filter.$or = ['title', 'company', 'category', 'description'].map(key => ({ [key]: new RegExp(escapeRegex(q), 'i') }));
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));
  const ordering = sort === 'stipend' ? { stipend: -1 } : sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
  const [items, total] = await Promise.all([
    Internship.find(filter).populate('postedBy', 'name company').sort(ordering).skip((pageNumber - 1) * pageSize).limit(pageSize),
    Internship.countDocuments(filter)
  ]);
  res.json({ items, pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
}

export async function featuredInternships(_req, res) {
  const items = await Internship.find({ status: 'active' }).sort({ featured: -1, createdAt: -1 }).limit(6).populate('postedBy', 'name company');
  res.json({ items });
}

export async function publicStats(_req, res) {
  const [openRoles, hiringTeams, applications, categories] = await Promise.all([
    Internship.countDocuments({ status: 'active' }),
    Internship.distinct('postedBy', { status: 'active' }),
    Application.countDocuments(),
    Internship.distinct('category', { status: 'active' })
  ]);
  const registeredEmployers = await User.countDocuments({ role: 'employer' });
  res.json({ stats: { openRoles, hiringTeams: hiringTeams.length, applications, categories: categories.length, registeredEmployers } });
}

export async function getInternship(req, res) {
  const item = await Internship.findById(req.params.id).populate('postedBy', 'name company');
  if (!item) return res.status(404).json({ message: 'Internship not found.' });
  res.json({ internship: item });
}

export async function createInternship(req, res) {
  const fields = pickWritableFields(req.body);
  if (req.user.role === 'admin' && typeof req.body.featured === 'boolean') fields.featured = req.body.featured;
  const item = await Internship.create({ ...fields, postedBy: req.user.id });
  res.status(201).json({ internship: item });
}

export async function updateInternship(req, res) {
  const item = await Internship.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Internship not found.' });
  if (!permitted(req, item)) return res.status(403).json({ message: 'You can only manage your own postings.' });
  Object.assign(item, pickWritableFields(req.body));
  if (req.user.role === 'admin' && typeof req.body.featured === 'boolean') item.featured = req.body.featured;
  await item.save();
  res.json({ internship: item });
}

export async function deleteInternship(req, res) {
  const item = await Internship.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Internship not found.' });
  if (!permitted(req, item)) return res.status(403).json({ message: 'You can only manage your own postings.' });
  await Promise.all([
    item.deleteOne(),
    Application.deleteMany({ internship: item.id }),
    SavedInternship.deleteMany({ internship: item.id })
  ]);
  res.status(204).end();
}

export async function mine(req, res) {
  const filter = req.user.role === 'admin' ? {} : { postedBy: req.user.id };
  const items = await Internship.find(filter).populate('postedBy', 'name company').sort({ createdAt: -1 });
  res.json({ items });
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
