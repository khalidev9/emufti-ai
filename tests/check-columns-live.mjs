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

// Check columns on subscriptions
async function checkColumns(table, cols) {
  for (const col of cols) {
    const { error } = await supabase.from(table).select(col).limit(1);
    console.log(`${table}.${col}:`, error ? `${error.code} - ${error.message}` : 'EXISTS');
  }
}

console.log('--- Checking subscriptions columns ---');
await checkColumns('subscriptions', ['id', 'user_id', 'plan', 'plan_id', 'status', 'provider', 'request_id', 'updated_at', 'current_period_end']);

console.log('\n--- Checking profiles columns ---');
await checkColumns('profiles', ['id', 'email', 'role', 'plan', 'plan_activated_at', 'updated_at']);

console.log('\n--- Checking plan_requests columns ---');
await checkColumns('plan_requests', ['id', 'reference_id', 'user_id', 'email', 'full_name', 'plan', 'plan_slug', 'status', 'payment_verified', 'admin_notes', 'message', 'updated_at']);
