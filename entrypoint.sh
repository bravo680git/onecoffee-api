#!/bin/sh

npx prisma migrate deploy
node --env-file=seed.env dist/prisma/seed.js
node dist/src/main.js