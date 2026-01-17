#!/bin/sh

npx prisma@5.18.0 migrate deploy
node dist/prisma/seed.js
node dist/src/main.js