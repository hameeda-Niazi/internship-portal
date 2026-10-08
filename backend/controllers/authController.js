import User from '../models/User.js';
import { signToken, publicUser } from '../utils/token.js';

export async function register(req, res) {
  const { name, email, password, role, company } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  if (role && !['user', 'employer'].includes(role)) return res.status(400).json({ message: 'Choose a valid account type.' });
  const user = await User.create({ name, email, password, role: role || 'user', company });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +resumePath +resumePublicId');
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Incorrect email or password.' });
  res.json({ token: signToken(user), user: publicUser(user) });
}

export async function currentUser(req, res) {
  res.json({ user: publicUser(req.user) });
}
