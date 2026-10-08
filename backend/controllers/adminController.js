import User from '../models/User.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import ContactMessage from '../models/ContactMessage.js';

export async function stats(_req, res) {
  const [users, employers, internships, applications, messages] = await Promise.all([
    User.countDocuments({ role: 'user' }), User.countDocuments({ role: 'employer' }),
    Internship.countDocuments(), Application.countDocuments(), ContactMessage.countDocuments({ status: 'new' })
  ]);
  res.json({ stats: { users, employers, internships, applications, messages } });
}
