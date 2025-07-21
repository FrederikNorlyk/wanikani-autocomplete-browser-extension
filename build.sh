#!/bin/bash

# Exit on error
set -e

# Create dist folder if missing
mkdir -p dist

# Clean up old zip if it exists
rm -f dist/extension.zip

cd src

# Zip all files and folders inside src/ (without the folder itself)
zip -r ../dist/extension.zip ./*

cd ..

echo "Build complete: dist/extension.zip"
