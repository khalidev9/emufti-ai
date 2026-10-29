import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let url = '', key = '';
for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Check what tables anon can query
for (const table of ['plans', 'plan_requests', 'profiles', 'subscriptions', 'conversations', 'messages', 'plan_request_tracking']) {
  const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: false }).limit(2);
  console.log(`Table [${table}]:`, { rowCount: data?.length, totalCount: count, error: error?.code, msg: error?.message });
}
