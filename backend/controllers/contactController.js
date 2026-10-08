import ContactMessage from '../models/ContactMessage.js';

export async function createMessage(req, res) {
  const { name, email, subject, message } = req.body;
  if (![name, email, subject, message].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ message: 'Name, email, subject and message are required.' });
  }
  await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({ message: 'Thanks for reaching out. We will be in touch soon.' });
}

export async function listMessages(_req, res) {
  res.json({ items: await ContactMessage.find().sort({ createdAt: -1 }) });
}

export async function updateMessage(req, res) {
  if (!['new', 'read', 'resolved'].includes(req.body.status)) return res.status(400).json({ message: 'Choose a valid message status.' });
  const item = await ContactMessage.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Message not found.' });
  res.json({ message: item });
}

export async function deleteMessage(req, res) {
  const item = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Message not found.' });
  res.status(204).end();
}
