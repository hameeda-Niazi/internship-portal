import { loadEnvironment } from '../config/env.js';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';

loadEnvironment();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Portal Admin';

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before creating the admin.');
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters.');
  }

  await connectDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === 'admin') {
      console.log(`Admin account ${email} already exists; no changes made.`);
      return;
    }
    throw new Error(`An account already uses ${email} with a non-admin role. No changes made. Set ADMIN_EMAIL to a new email address.`);
  }

  try {
    await User.create({ name, email, password, role: 'admin' });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error(`An account already uses ${email}. No changes made.`);
    }
    throw error;
  }

  console.log(`Admin account ${email} created successfully.`);
}

try {
  await createAdmin();
} catch (error) {
  console.error(`Unable to create admin: ${error.message}`);
  process.exitCode = 1;
} finally {
  const mongoose = await import('mongoose');
  if (mongoose.default.connection.readyState !== 0) {
    await mongoose.default.disconnect();
  }
}
