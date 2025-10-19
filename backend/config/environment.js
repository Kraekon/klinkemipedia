const path = require('path');
const fs = require('fs');

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = path.join(__dirname, '..', '..');
    this.envPath = path.join(this.projectRoot, '.env');
  }

  loadEnvironment() {
    if (!fs.existsSync(this.envPath)) {
      this.errors.push({
        message: `.env file not found at: ${this.envPath}`,
        fix: 'Please create a .env file in the project root directory.'
      });
      return false;
    }

    require('dotenv').config({ path: this.envPath });
    return true;
  }

  validateVariables() {
    if (!process.env.MONGODB_URI) {
      this.errors.push({
        message: 'MONGODB_URI is not set',
        fix: 'Add MONGODB_URI to your .env file. See .env.example for the format.'
      });
    } else {
      const mongoUriPattern = /^mongodb(\+srv)?:\/\/.+/;
      if (!mongoUriPattern.test(process.env.MONGODB_URI)) {
        this.errors.push({
          message: 'MONGODB_URI has invalid format',
          fix: 'MONGODB_URI should start with mongodb:// or mongodb+srv://'
        });
      }
    }

    // Use PORT from .env or default to 5000
    if (!process.env.PORT) {
      this.warnings.push({
        message: 'PORT not set, defaulting to 5000',
        fix: 'Add PORT=5000 to your .env file'
      });
      process.env.PORT = '5001';
    }

    if (!process.env.NODE_ENV) {
      this.warnings.push({
        message: 'NODE_ENV not set, defaulting to development',
        fix: 'Add NODE_ENV=development to your .env file'
      });
      process.env.NODE_ENV = 'development';
    }
  }

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

    if (this.errors.length > 0) {
      this.errors.forEach(error => {
        console.log(`❌ ${error.message}`);
        console.log(`   ${error.fix}\n`);
      });
    }

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

function validate() {
  const validator = new EnvironmentValidator();
  return validator.validate();
}

function getEnv(key, defaultValue) {
  return process.env[key] || defaultValue;
}

module.exports = {
  validate,
  getEnv,
  EnvironmentValidator
};