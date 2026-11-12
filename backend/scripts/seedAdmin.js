import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  const adminName = process.env.ADMIN_NAME || 'Prabhat Admin';
  const adminEmail = (process.env.ADMIN_EMAIL || 'prabhatadmin@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Code@123';

  if (!adminEmail || !adminPassword || !adminName) {
    console.error('[Admin Seed Error] ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in environment variables.');
    process.exit(1);
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codementor_ai';

  try {
    console.log('[Admin Seed] Connecting to MongoDB database...');
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Admin Seed] Connected successfully to MongoDB.`);

    const existingUser = await User.findOne({ email: adminEmail }).exec();

    if (existingUser) {
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`[Admin Seed Success] Updated existing user account '${adminEmail}' to 'admin' role.`);
      } else {
        console.log(`[Admin Seed Info] Admin account '${adminEmail}' already exists. Role verified.`);
      }
    } else {
      const newAdmin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // User model pre-save hook automatically hashes with bcrypt
        role: 'admin'
      });
      console.log(`[Admin Seed Success] Created initial administrator account for '${newAdmin.email}'.`);
    }

    await mongoose.disconnect();
    console.log('[Admin Seed] Disconnected cleanly from MongoDB. Admin provisioning complete.');
    process.exit(0);
  } catch (error) {
    console.error(`[Admin Seed Error] Failed to complete admin provisioning: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
