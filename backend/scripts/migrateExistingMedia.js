const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const Media = require('../models/Media');

// Update this to match your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/klinkemipedia';
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');

async function migrateExistingMedia() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if uploads directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log('❌ Uploads directory not found:', UPLOADS_DIR);
      process.exit(1);
    }

    // Read all files in uploads directory
    const files = fs.readdirSync(UPLOADS_DIR);
    console.log(`📂 Found ${files.length} files in uploads directory`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const filename of files) {
      try {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = fs.statSync(filePath);

        // Skip if not a file
        if (!stats.isFile()) {
          console.log(`⏭️  Skipping non-file: ${filename}`);
          skipped++;
          continue;
        }

        // Check if already exists in database
        const existing = await Media.findOne({ filename });
        if (existing) {
          console.log(`⏭️  Already exists: ${filename}`);
          skipped++;
          continue;
        }

        // Determine if it's an image
        const ext = path.extname(filename).toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        
        if (!imageExtensions.includes(ext)) {
          console.log(`⏭️  Not an image: ${filename}`);
          skipped++;
          continue;
        }

        // Get image dimensions
        let dimensions = { width: null, height: null };
        try {
          const size = sizeOf(filePath);
          dimensions.width = size.width;
          dimensions.height = size.height;
        } catch (err) {
          console.warn(`⚠️  Could not get dimensions for ${filename}`);
        }

        // Determine MIME type
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.bmp': 'image/bmp',
          '.svg': 'image/svg+xml'
        };
        const mimeType = mimeTypes[ext] || 'application/octet-stream';

        // Extract original name (remove timestamp if present)
        // Format: 1760862352355-Trollface.png -> Trollface.png
        let originalName = filename;
        const match = filename.match(/^\d+-(.+)$/);
        if (match) {
          originalName = match[1];
        }

        // Create Media document
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
          usageCount: 0 // Will be calculated separately if needed
        });

        await mediaDoc.save();
        console.log(`✅ Migrated: ${filename}`);
        migrated++;

      } catch (err) {
        console.error(`❌ Error processing ${filename}:`, err.message);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📁 Total files: ${files.length}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateExistingMedia();