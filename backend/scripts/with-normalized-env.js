#!/usr/bin/env node
/**
 * Normalize DATABASE_URL then run the given command with the same env.
 * Use for build/start on Render so Prisma never sees quotes or jdbc: scheme.
 * Usage: node scripts/with-normalized-env.js "npx prisma generate && npm run build"
 */
const { execSync } = require('child_process');

let url = process.env.DATABASE_URL;
if (url != null && typeof url === 'string') {
  url = url.trim();
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  if (url.startsWith('jdbc:mysql://')) url = 'mysql://' + url.slice(12);
  else if (url.startsWith('jdbc:mariadb://')) url = 'mysql://' + url.slice(14);
  process.env.DATABASE_URL = url;
}

const cmd = process.argv[2];
if (!cmd) {
  console.error('Usage: node scripts/with-normalized-env.js "<command>"');
  process.exit(1);
}
execSync(cmd, { stdio: 'inherit', env: process.env, shell: true });
