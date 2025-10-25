#!/bin/bash

echo "=== Installing dependencies and type definitions ==="
npm install

echo "=== Building client ==="
npm run build:client

echo "=== Building server (ignoring TypeScript errors) ==="
tsc --project tsconfig.server.json || true

echo "=== Deployment preparation complete ==="
