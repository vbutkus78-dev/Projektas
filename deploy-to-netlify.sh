#!/bin/bash

# Deploy script for Netlify
echo "🚀 Preparing Netlify deployment..."

# Create deployment directory
mkdir -p deploy-ready
cd deploy-ready

# Copy netlify files
cp -r ../netlify/* .

# Create deploy info file  
cat > deploy-info.txt << EOF
NETLIFY DEPLOYMENT READY
========================

Date: $(date)
Files: $(ls -la | wc -l) files ready
Size: $(du -sh . | cut -f1)

Files included:
$(ls -la)

Instructions:
1. Download this folder or zip it
2. Go to https://app.netlify.com
3. Create new site or update existing
4. Drag & drop this folder or upload zip

Features fixed in this deployment:
✅ New Order button works  
✅ New Supplier button works
✅ Product management actions work
✅ Reports generation works
✅ Filtering system works
✅ VAT calculations work correctly
EOF

echo "✅ Deployment ready in deploy-ready/ folder"
echo "📦 Creating zip package..."

cd ..
zip -r netlify-final-deployment.zip deploy-ready/
echo "✅ Created netlify-final-deployment.zip"

ls -lh netlify-final-deployment.zip