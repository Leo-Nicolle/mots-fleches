#!/bin/sh

cd client
npm run build
cd ../server
npm run build
cd ../
rm -rf dist
mkdir dist
cp server/dist/server.cjs.js dist/server.js
cp -R server/public dist/
cp -R client/dist/* dist/public/
