require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Media = require('../models/Media');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/klinkemipedia';

async function checkMedia() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const count = await Media.countDocuments();
    console.log(`📊 Total media items in database: ${count}`);

    const media = await Media.find({}).limit(10);
    console.log('\n📷 Media items:');
    media.forEach(item => {
      console.log(`  - ${item.filename}`);
      console.log(`    Original: ${item.originalName}`);
      console.log(`    URL: ${item.url}`);
      console.log(`    Size: ${item.size} bytes`);
      console.log('');
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMedia();