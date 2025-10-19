require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const Media = require('../models/Media');

// Get the SAME connection string your server uses
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/klinkemipedia';
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');

async function forceMigrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📍 Database:', mongoose.connection.db.databaseName);

    // Clear existing media
    const deleteResult = await Media.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing records`);

    // Check uploads directory
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log('❌ Uploads directory not found:', UPLOADS_DIR);
      process.exit(1);
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    console.log(`📂 Found ${files.length} files in uploads directory`);

    let migrated = 0;
    let skipped = 0;

    for (const filename of files) {
      try {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = fs.statSync(filePath);

        if (!stats.isFile()) {
          skipped++;
          continue;
        }

        const ext = path.extname(filename).toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        
        if (!imageExtensions.includes(ext)) {
          console.log(`⏭️  Skipping non-image: ${filename}`);
          skipped++;
          continue;
        }

        let dimensions = { width: null, height: null };
        try {
          const size = sizeOf(filePath);
          dimensions.width = size.width;
          dimensions.height = size.height;
        } catch (err) {
          console.warn(`⚠️  Could not get dimensions for ${filename}`);
        }

        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.bmp': 'image/bmp'
        };
        const mimeType = mimeTypes[ext] || 'image/jpeg';

        let originalName = filename;
        const match = filename.match(/^\d+-(.+)$/);
        if (match) {
          originalName = match[1];
        }

        const mediaDoc = new Media({
          filename,
          originalName,
          mimeType,
          size: stats.size,
          width: dimensions.width,
          height: dimensions.height,
          url: `/uploads/${filename}`,
          uploadedBy: 'admin',
          uploadedAt: stats.birthtime || stats.mtime,
          usageCount: 0
        });

        await mediaDoc.save();
        console.log(`✅ Migrated: ${filename}`);
        migrated++;

      } catch (err) {
        console.error(`❌ Error processing ${filename}:`, err.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);

    // Verify
    const finalCount = await Media.countDocuments();
    console.log(`\n✅ Final count in database: ${finalCount}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

forceMigrate();