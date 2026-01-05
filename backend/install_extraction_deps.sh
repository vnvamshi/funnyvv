#!/bin/bash
# Install dependencies for PDF extraction

cd "$HOME/vistaview_WORKING/backend"

npm install pdf-parse xlsx minio multer axios --save

echo "✅ Dependencies installed"
