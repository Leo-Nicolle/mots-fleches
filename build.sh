#!/bin/sh

cd grid
npm run build
cd ../client-2
npm run build
cd ../server
npm run build
cd ../
rm -rf dist
mkdir dist
cp server/dist/server.js dist/server.js
cp -R server/public dist/
cp -R client-2/dist/* dist/public/
