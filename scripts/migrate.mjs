import fs from 'node:fs/promises';
import pg from 'pg';
import { rootCertificates } from 'node:tls';

// Run inside Vercel: sensitive integration credentials never leave its environment.
if (process.env.RUN_DB_MIGRATIONS !== '1') {
  console.log('Database migrations not enabled for this build.');
  process.exit(0);
}
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!connectionString) throw new Error('A Postgres connection is required to apply migrations.');
const databaseUrl = new URL(connectionString);
databaseUrl.searchParams.delete('sslmode');
const ca = await fs.readFile(new URL('./supabase-ca.crt', import.meta.url), 'utf8');
const client = new pg.Client({ connectionString: databaseUrl.href, connectionTimeoutMillis: 15000, ssl: { ca: [...rootCertificates, ca], rejectUnauthorized: true } });
try {
  await client.connect();
  await client.query("SELECT pg_advisory_lock(hashtext('justmyllc_schema'))");
  await client.query('CREATE TABLE IF NOT EXISTS public.app_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
  const { rows } = await client.query("SELECT to_regclass('public.orders') AS table_name");
  const files = rows[0].table_name
    ? ['migrations/20260919_formation_catalog.sql', 'migrations/20260920_direct_checkout.sql', 'migrations/20260926_contact_details.sql']
    : ['supabase-schema.sql', 'migrations/20260919_formation_catalog.sql', 'migrations/20260920_direct_checkout.sql', 'migrations/20260926_contact_details.sql'];
  for (const file of files) {
    const { rowCount } = await client.query('SELECT name FROM public.app_migrations WHERE name=$1', [file]);
    if (rowCount) continue;
    const sql = (await fs.readFile(file, 'utf8')).replace(/^BEGIN;\s*$/gm, '').replace(/^COMMIT;\s*$/gm, '');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO public.app_migrations(name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Applied ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
  await client.query("NOTIFY pgrst, 'reload schema'");
  const { rows: checks } = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name IN ('access_token_hash','request_hash','checkout_id','payment_id','terms_accepted_at')");
  if (checks.length !== 5) throw new Error('Order schema verification failed.');
  console.log('Order schema verified.');
} catch (error) {
  // Avoid logging connection strings, credentials or row contents.
  console.error('Database migration failed:', error.code || error.name);
  process.exitCode = 1;
} finally {
  await client.end();
}
