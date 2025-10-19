/**
 * Create Admin User Script
 * Run with: node backend/scripts/createAdmin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Created: ${existingAdmin.createdAt}\n`);
      
      const overwrite = await question('Create another admin user? (y/n): ');
      
      if (overwrite.toLowerCase() !== 'y') {
        console.log('\n❌ Cancelled');
        process.exit(0);
      }
      console.log('');
    }
    
    // Get username
    const username = await question('Enter admin username: ');
    
    if (!username || username.trim().length < 3) {
      console.log('\n❌ Username must be at least 3 characters');
      process.exit(1);
    }
    
    // Check if username exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      console.log('\n❌ Username already exists');
      process.exit(1);
    }
    
    // Get password
    const password = await question('Enter admin password (min 6 characters): ');
    
    if (!password || password.length < 6) {
      console.log('\n❌ Password must be at least 6 characters');
      process.exit(1);
    }
    
    // Confirm password
    const confirmPassword = await question('Confirm password: ');
    
    if (password !== confirmPassword) {
      console.log('\n❌ Passwords do not match');
      process.exit(1);
    }
    
    // Create user
    const user = new User({
      username: username.toLowerCase(),
      password,
      role: 'admin'
    });
    
    await user.save();
    
    console.log('\n✅ Admin user created successfully!');
    console.log('─────────────────────────────────────');
    console.log(`Username: ${user.username}`);
    console.log(`Created: ${user.createdAt}`);
    console.log('─────────────────────────────────────');
    console.log('\n🎉 You can now login at: http://localhost:3000/admin/login\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();