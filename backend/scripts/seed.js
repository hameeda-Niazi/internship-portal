import { loadEnvironment } from '../config/env.js';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';
import Internship from '../models/Internship.js';

loadEnvironment();

const examples = [
  ['Frontend Developer Intern', 'Brightside Labs', 'Software Development', 'Remote', '3 months', '₹15,000 / month', 'Build accessible, responsive interfaces with React and collaborate with product designers and engineers.', ['React', 'JavaScript', 'CSS'], true],
  ['MERN Stack Intern', 'Northstar Digital', 'Software Development', 'Hybrid', '6 months', '₹20,000 / month', 'Work across MongoDB, Express, React and Node.js to ship product features used by real customers.', ['MongoDB', 'Express', 'React', 'Node.js'], true],
  ['UI/UX Design Intern', 'Goodkind Studio', 'Design', 'On-site', '3 months', '₹12,000 / month', 'Support user research, wireframing and high-fidelity design for thoughtful digital experiences.', ['Figma', 'Prototyping', 'Research'], true],
  ['Python Developer Intern', 'Data Orchard', 'Data & AI', 'Remote', '4 months', '₹18,000 / month', 'Create Python services and data tools with guidance from an experienced engineering team.', ['Python', 'Django', 'SQL'], false],
  ['Digital Marketing Intern', 'Sunday Market', 'Marketing', 'Hybrid', '2 months', '₹10,000 / month', 'Help grow a loved consumer brand through content, campaign experiments and performance insights.', ['SEO', 'Content', 'Analytics'], false],
  ['WordPress Developer Intern', 'Pixel & Pine', 'Web Development', 'Remote', '3 months', '₹12,000 / month', 'Create polished websites and custom WordPress experiences for small creative businesses.', ['WordPress', 'PHP', 'CSS'], false]
];

try {
  await connectDatabase();
  let employer = await User.findOne({ email: 'seed-employer@internship-portal.local' });
  if (!employer) employer = await User.create({
    name: 'Internship Portal Seed', email: 'seed-employer@internship-portal.local',
    password: `${crypto.randomUUID()}Aa1!`, role: 'employer', company: 'Community Partners'
  });
  for (const [title, company, category, type, duration, stipend, description, skills, featured] of examples) {
    await Internship.updateOne({ title, company }, {
      $setOnInsert: { title, company, category, location: type === 'Remote' ? 'Anywhere' : 'Bengaluru, India',
        type, duration, stipend, description, skills,
        requirements: [`Demonstrated interest in ${category.toLowerCase()}`, 'Clear written communication', 'Curiosity and willingness to learn'],
        postedBy: employer.id, featured }
    }, { upsert: true });
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
    if (!existing) await User.create({
      name: process.env.ADMIN_NAME || 'Portal Admin', email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD, role: 'admin'
    });
  }
  console.log(`Seeded ${examples.length} sample internships.`);
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  const mongoose = await import('mongoose');
  await mongoose.default.disconnect();
}
