#!/usr/bin/env node
/**
 * Render start script: resolve P3009 failed migration (if any), run migrate deploy, then start server.
 * Use as Start Command on Render: node scripts/start-with-migrate.js
 */
const { execSync, spawnSync } = require('child_process');

// Normalize DATABASE_URL (same as with-normalized-env.js)
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

const FAILED_MIGRATION = '20240303100000_add_missing_updated_at';

// Step 1: Mark failed migration as applied (fixes P3009). Ignore errors.
console.log('Resolving any failed migration...');
const resolve = spawnSync('npx', ['prisma', 'migrate', 'resolve', '--applied', FAILED_MIGRATION], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});
if (resolve.status !== 0) {
  console.log('(resolve step skipped or already applied, continuing)');
}

// Step 2: Run migrations
console.log('Running prisma migrate deploy...');
execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env, shell: true });

// Step 3: Start server
console.log('Starting server...');
execSync('node dist/server.js', { stdio: 'inherit', env: process.env, shell: true });
