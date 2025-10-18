# Klinkemipedia Setup Guide

This guide will help you set up and troubleshoot the Klinkemipedia application.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Environment Configuration](#environment-configuration)
3. [Starting the App](#starting-the-app)
4. [Troubleshooting](#troubleshooting)
5. [Configuration Files Reference](#configuration-files-reference)
6. [Health Check Usage](#health-check-usage)

---

## Initial Setup

### Prerequisites
- Node.js v14 or higher
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kraekon/klinkemipedia.git
   cd klinkemipedia
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit the .env file** with your configuration (see [Environment Configuration](#environment-configuration))

5. **Start the application:**
   ```bash
   npm run dev
   ```

---

## Environment Configuration

### .env File Location

**IMPORTANT:** The `.env` file MUST be in the **project root directory**, not in `backend/`.

```
klinkemipedia/
├── .env              ← HERE (project root)
├── .env.example      ← Template file
├── backend/
├── src/
└── ...
```

### Required Environment Variables

#### MONGODB_URI
Your MongoDB connection string.

**For MongoDB Atlas (Cloud):**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/klinkemipedia?retryWrites=true&w=majority
```

**For Local MongoDB:**
```bash
MONGODB_URI=mongodb://localhost:27017/klinkemipedia
```

**How to get MongoDB Atlas URI:**
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<database>` with your database name (e.g., `klinkemipedia`)

#### PORT
The server port. **This is locked to 5001** to prevent configuration drift.

```bash
PORT=5001
```

If you try to use a different port, the system will force it back to 5001 and show a warning.

#### NODE_ENV
The environment mode.

```bash
NODE_ENV=development
```

Options: `development`, `production`, `test`

---

## Starting the App

### Development Mode (Recommended)

Run both frontend and backend together:
```bash
npm run dev
```

This will start:
- React frontend on http://localhost:3000
- Express backend on http://localhost:5001

### Backend Only

Run just the backend server:
```bash
npm run server
```

### Frontend Only

Run just the React frontend:
```bash
npm start
```

### What to Expect on Startup

When you start the application, you should see:

```
🔍 Environment Configuration Check:
─────────────────────────────────────
✅ .env file loaded from: /path/to/klinkemipedia/.env
✅ All environment variables validated successfully
✅ MongoDB URI configured
✅ Server will run on port 5001
─────────────────────────────────────

🏥 Running Startup Health Checks:
═══════════════════════════════════════

🔍 Checking port 5001 availability...
✅ Port 5001 is available
🔍 Checking MongoDB connection...
✅ MongoDB connection healthy
   Connected to: cluster.mongodb.net
   Database: klinkemipedia

═══════════════════════════════════════
Health Check Summary: 2 passed, 0 failed
✅ All health checks passed!
═══════════════════════════════════════

🚀 Server Started Successfully!
─────────────────────────────────────
📡 API available at: http://localhost:5001
🏥 Health check: http://localhost:5001/api/health
📚 Articles API: http://localhost:5001/api/articles
─────────────────────────────────────
```

---

## Troubleshooting

### Issue: .env file not found

**Error message:**
```
❌ .env file not found at: /path/to/klinkemipedia/.env
   Please create a .env file in the project root directory.
```

**Solution:**
1. Make sure you're in the project root directory
2. Copy the example file: `cp .env.example .env`
3. Ensure the file is named `.env` (not `.env.txt` or similar)
4. The file should be in the same directory as `package.json`

### Issue: MONGODB_URI not set

**Error message:**
```
❌ MONGODB_URI is not set
   Add MONGODB_URI to your .env file. See .env.example for the format.
```

**Solution:**
1. Open your `.env` file
2. Add the line: `MONGODB_URI=mongodb://localhost:27017/klinkemipedia`
3. Or use your MongoDB Atlas connection string
4. Save the file and restart the server

### Issue: Invalid MongoDB URI format

**Error message:**
```
❌ MONGODB_URI has invalid format
   MONGODB_URI should start with mongodb:// or mongodb+srv://
```

**Solution:**
- Ensure your URI starts with `mongodb://` or `mongodb+srv://`
- Check for typos in the connection string
- Refer to `.env.example` for the correct format

### Issue: Port 5001 already in use

**Error message:**
```
❌ Port 5001 is already in use
   Please stop the other process or choose a different port
```

**Solution:**
1. Find what's using port 5001:
   - **macOS/Linux:** `lsof -i :5001`
   - **Windows:** `netstat -ano | findstr :5001`
2. Stop the conflicting process
3. Or kill it (use the PID from above):
   - **macOS/Linux:** `kill -9 <PID>`
   - **Windows:** `taskkill /PID <PID> /F`

### Issue: MongoDB connection fails

**Error message:**
```
⚠️  MongoDB connection check failed
   Error: connect ECONNREFUSED
```

**Solutions:**

**For Local MongoDB:**
1. Ensure MongoDB is running:
   - **macOS:** `brew services start mongodb-community`
   - **Linux:** `sudo systemctl start mongod`
   - **Windows:** Start MongoDB service from Services panel
2. Check if MongoDB is listening: `mongosh` or `mongo`

**For MongoDB Atlas:**
1. Check your internet connection
2. Verify the connection string is correct
3. Ensure your IP address is whitelisted in Atlas:
   - Go to Network Access in Atlas
   - Add your IP address or use `0.0.0.0/0` for testing (allow all)
4. Verify your username and password are correct
5. Check if the database user has proper permissions

### Issue: Wrong port being used

**Warning message:**
```
⚠️  PORT is set to 5000, but should be 5001
   Forcing PORT to 5001
```

**Solution:**
This is automatically fixed! The system forces PORT to 5001. Update your `.env` file to avoid the warning:
```bash
PORT=5001
```

### Issue: Server starts but MongoDB isn't connected

This is not critical. The server will continue running, but database operations will fail.

**What you'll see:**
```
⚠️  MongoDB not connected yet
   This is not critical - the server will still start
   Database operations will fail until connection is established
```

**Solution:**
1. Check the MongoDB error messages above
2. Fix your `MONGODB_URI` in `.env`
3. Restart the server

---

## Configuration Files Reference

### `.env` (Project Root)
Main configuration file. Contains:
- `MONGODB_URI` - Database connection string
- `PORT` - Server port (must be 5001)
- `NODE_ENV` - Environment mode

### `.env.example` (Project Root)
Template for `.env` file. Copy this to create your own `.env`.

### `backend/config/environment.js`
Validates environment variables on startup:
- Checks `.env` file location
- Validates `MONGODB_URI` format
- Forces `PORT` to 5001
- Provides clear error messages

### `backend/config/startup.js`
Performs health checks before server starts:
- Checks MongoDB connection
- Validates port availability
- Shows detailed status for each check

### `backend/config/db.js`
MongoDB connection handler:
- Connects to MongoDB
- Handles connection errors
- Shows connection status

---

## Health Check Usage

### Health Check Endpoint

The application provides a health check endpoint for monitoring:

```
GET http://localhost:5001/api/health
```

**Response (healthy):**
```json
{
  "status": "healthy",
  "database": "connected",
  "port": 5001
}
```

**Response (unhealthy):**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "port": 5001
}
```

### Using the Health Check

**Manual check:**
```bash
curl http://localhost:5001/api/health
```

**In your browser:**
Navigate to: http://localhost:5001/api/health

**For monitoring tools:**
Use this endpoint in monitoring tools like:
- Uptime Robot
- New Relic
- Datadog
- Custom monitoring scripts

### Startup Health Checks

Automatic checks run every time you start the server:
1. **Port availability** - Ensures port 5001 is free
2. **MongoDB connection** - Verifies database connectivity

These checks happen before the server starts accepting requests, preventing misconfiguration issues.

---

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the error messages carefully - they usually contain the solution
2. Review the [README.md](../README.md) for general setup instructions
3. Check MongoDB connection with `mongosh` (for local) or MongoDB Atlas dashboard (for cloud)
4. Ensure all dependencies are installed: `npm install`
5. Try deleting `node_modules` and reinstalling: `rm -rf node_modules && npm install`

---

**Remember:** The `.env` file must be in the project root, and the port must be 5001!
