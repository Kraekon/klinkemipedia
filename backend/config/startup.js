const mongoose = require('mongoose');
const net = require('net');

/**
 * StartupHealthCheck - Performs health checks before server starts
 * Validates MongoDB connection and port availability
 */
class StartupHealthCheck {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.failed = 0;
  }

  /**
   * Check if MongoDB connection is working
   */
  async checkMongoDB() {
    console.log('🔍 Checking MongoDB connection...');
    
    try {
      // Check if mongoose is already connected
      if (mongoose.connection.readyState === 1) {
        // Already connected, verify with ping
        await mongoose.connection.db.admin().ping();
        console.log('✅ MongoDB connection healthy');
        
        // Get connection details
        const host = mongoose.connection.host;
        const dbName = mongoose.connection.name;
        
        if (host) {
          console.log(`   Connected to: ${host}`);
        }
        if (dbName) {
          console.log(`   Database: ${dbName}`);
        }
        
        this.checks.push({ name: 'MongoDB', status: 'passed' });
        this.passed++;
        return true;
      } else if (mongoose.connection.readyState === 2) {
        // Connecting state - wait a bit
        console.log('⏳ MongoDB is connecting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.db.admin().ping();
          console.log('✅ MongoDB connection healthy');
          
          const host = mongoose.connection.host;
          const dbName = mongoose.connection.name;
          
          if (host) {
            console.log(`   Connected to: ${host}`);
          }
          if (dbName) {
            console.log(`   Database: ${dbName}`);
          }
          
          this.checks.push({ name: 'MongoDB', status: 'passed' });
          this.passed++;
          return true;
        }
      }
      
      // Not connected
      console.log('⚠️  MongoDB not connected yet');
      console.log('   This is not critical - the server will still start');
      console.log('   Database operations will fail until connection is established');
      this.checks.push({ name: 'MongoDB', status: 'warning' });
      return true; // Don't fail startup for MongoDB issues
      
    } catch (error) {
      console.log('⚠️  MongoDB connection check failed');
      console.log(`   Error: ${error.message}`);
      console.log('   This is not critical - the server will still start');
      console.log('   Please check your MONGODB_URI in .env file');
      this.checks.push({ name: 'MongoDB', status: 'warning' });
      return true; // Don't fail startup for MongoDB issues
    }
  }

  /**
   * Check if the specified port is available
   */
  async checkPort(port) {
    console.log(`🔍 Checking port ${port} availability...`);
    
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`❌ Port ${port} is already in use`);
          console.log('   Please stop the other process or choose a different port');
          this.checks.push({ name: `Port ${port}`, status: 'failed' });
          this.failed++;
          resolve(false);
        } else {
          console.log(`⚠️  Error checking port ${port}: ${err.message}`);
          this.checks.push({ name: `Port ${port}`, status: 'warning' });
          resolve(true);
        }
      });
      
      server.once('listening', () => {
        server.close();
        console.log(`✅ Port ${port} is available`);
        this.checks.push({ name: `Port ${port}`, status: 'passed' });
        this.passed++;
        resolve(true);
      });
      
      server.listen(port);
    });
  }

  /**
   * Run all health checks
   */
  async runChecks(port = 5001) {
    console.log('\n🏥 Running Startup Health Checks:');
    console.log('═══════════════════════════════════════\n');
    
    // Check port availability
    const portAvailable = await this.checkPort(port);
    
    // Check MongoDB connection
    await this.checkMongoDB();
    
    // Print summary
    console.log('\n═══════════════════════════════════════');
    console.log(`Health Check Summary: ${this.passed} passed, ${this.failed} failed`);
    
    if (this.failed > 0) {
      console.log('❌ Some health checks failed!');
      console.log('Please fix the issues above before starting the server.');
      console.log('═══════════════════════════════════════\n');
      return false;
    } else {
      console.log('✅ All health checks passed!');
      console.log('═══════════════════════════════════════\n');
      return true;
    }
  }
}

module.exports = StartupHealthCheck;
