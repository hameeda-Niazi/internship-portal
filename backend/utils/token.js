import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export function publicUser(user) {
  return {
    id: user.id, name: user.name, email: user.email, role: user.role,
    company: user.company, headline: user.headline, bio: user.bio,
    location: user.location, phone: user.phone, skills: user.skills,
    hasResume: Boolean(user.resumePath || user.resumePublicId), createdAt: user.createdAt
  };
}
