/**
 * Normalize DATABASE_URL so Prisma accepts it (avoids P1013 on Render).
 * Run before any code that loads Prisma. No other imports here.
 */
const raw = process.env.DATABASE_URL;
if (raw != null && typeof raw === 'string') {
  let url = raw.trim();
  // Remove surrounding single or double quotes (common when pasting in dashboards)
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  // Accept jdbc:mysql:// and convert to mysql://
  if (url.startsWith('jdbc:mysql://')) {
    url = 'mysql://' + url.slice(12);
  } else if (url.startsWith('jdbc:mariadb://')) {
    url = 'mysql://' + url.slice(14);
  }
  process.env.DATABASE_URL = url;
}
