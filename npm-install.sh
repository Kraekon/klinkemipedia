#!/bin/bash
echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

echo "Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps
cd ..

echo "✅ All dependencies installed!"