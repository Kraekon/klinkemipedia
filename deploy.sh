#!/bin/bash
set -e

echo "Building React app..."
npm ci
npm run build

echo "Deploying to VPS..."
rsync -avz --delete build/ deploy@72.61.177.23:/var/www/klinkemipedia/

echo "Reloading Nginx..."
ssh deploy@72.61.177.23 "sudo systemctl reload nginx"

echo "✅ Deploy complete! Visit https://klinkemipedia.se"