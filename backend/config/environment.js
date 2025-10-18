const path = require('path');
const fs = require('fs');

/**
 * EnvironmentValidator - Validates environment variables on startup
 * Ensures .env file is in the correct location and all required variables are present
 */
class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = path.join(__dirname, '..', '..');
    this.envPath = path.join(this.projectRoot, '.env');
  }

  /**
   * Load .env file from the correct location (project root)
   */
  loadEnvironment() {
    // Check if .env file exists in project root
    if (!fs.existsSync(this.envPath)) {
      this.errors.push({
        message: `.env file not found at: ${this.envPath}`,
        fix: 'Please create a .env file in the project root directory.'
      });
      return false;
    }

    // Load the .env file from the correct location
    require('dotenv').config({ path: this.envPath });
    return true;
  }

  /**
   * Validate required environment variables
   */
  validateVariables() {
    // Check MONGODB_URI
    if (!process.env.MONGODB_URI) {
      this.errors.push({
        message: 'MONGODB_URI is not set',
        fix: 'Add MONGODB_URI to your .env file. See .env.example for the format.'
      });
    } else {
      // Validate MongoDB URI format
      const mongoUriPattern = /^mongodb(\+srv)?:\/\/.+/;
      if (!mongoUriPattern.test(process.env.MONGODB_URI)) {
        this.errors.push({
          message: 'MONGODB_URI has invalid format',
          fix: 'MONGODB_URI should start with mongodb:// or mongodb+srv://'
        });
      }
    }

    // Force PORT to 5001
    const currentPort = process.env.PORT;
    if (currentPort && currentPort !== '5001') {
      this.warnings.push({
        message: `PORT is set to ${currentPort}, but should be 5001`,
        fix: 'Forcing PORT to 5001'
      });
      process.env.PORT = '5001';
    } else if (!currentPort) {
      process.env.PORT = '5001';
    }

    // Check NODE_ENV (optional, but good to have)
    if (!process.env.NODE_ENV) {
      this.warnings.push({
        message: 'NODE_ENV not set, defaulting to development',
        fix: 'Add NODE_ENV=development to your .env file'
      });
      process.env.NODE_ENV = 'development';
    }
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n🔍 Environment Configuration Check:');
    console.log('─────────────────────────────────────');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(`✅ .env file loaded from: ${this.envPath}`);
      console.log('✅ All environment variables validated successfully');
      if (process.env.MONGODB_URI) {
        console.log('✅ MongoDB URI configured');
      }
      console.log(`✅ Server will run on port ${process.env.PORT}`);
      console.log('─────────────────────────────────────\n');
      return true;
    }

    // Print errors
    if (this.errors.length > 0) {
      this.errors.forEach(error => {
        console.log(`❌ ${error.message}`);
        console.log(`   ${error.fix}\n`);
      });
    }

    // Print warnings
    if (this.warnings.length > 0) {
      this.warnings.forEach(warning => {
        console.log(`⚠️  ${warning.message}`);
        console.log(`   ${warning.fix}\n`);
      });
    }

    if (this.errors.length > 0) {
      console.log('❌ Environment validation failed!');
      console.log('─────────────────────────────────────\n');
      return false;
    }

    console.log('─────────────────────────────────────\n');
    return true;
  }

  /**
   * Main validation function
   */
  validate() {
    const envLoaded = this.loadEnvironment();
    
    if (!envLoaded) {
      this.printResults();
      return false;
    }

    this.validateVariables();
    return this.printResults();
  }
}

/**
 * Validate environment and return success status
 */
function validate() {
  const validator = new EnvironmentValidator();
  return validator.validate();
}

/**
 * Get environment variable with default value
 */
function getEnv(key, defaultValue) {
  return process.env[key] || defaultValue;
}

module.exports = {
  validate,
  getEnv,
  EnvironmentValidator
};
