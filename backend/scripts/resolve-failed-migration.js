#!/usr/bin/env node
/**
 * One-time fix for P3009: mark a failed migration as applied so deploy can continue.
 * Run from Render Shell (with backend as cwd) or locally with DATABASE_URL set:
 *   node scripts/with-normalized-env.js "npx prisma migrate resolve --applied \"20240303100000_add_missing_updated_at\""
 * Or in Render Shell:  npx prisma migrate resolve --applied "20240303100000_add_missing_updated_at"
 */
const { execSync } = require('child_process');
const migrationName = process.argv[2] || '20240303100000_add_missing_updated_at';

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

const cmd = `npx prisma migrate resolve --applied "${migrationName}"`;
console.log('Running:', cmd);
execSync(cmd, { stdio: 'inherit', env: process.env, shell: true });
console.log('Done. Redeploy or let the next deploy run migrate deploy + start.');
