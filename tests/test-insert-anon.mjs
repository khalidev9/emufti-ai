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

const testRef = `REQ-EMUFTI-TEST${Date.now().toString().slice(-4)}`;
const payload = {
  reference_id: testRef,
  full_name: 'Test Anonymous Seeker',
  email: 'test.seeker@example.com',
  whatsapp: '+252615001122',
  plan: 'pro',
  plan_slug: 'pro',
  status: 'pending',
  payment_verified: false,
};

console.log('Testing INSERT without .select()...');
const { error: insertErr } = await supabase.from('plan_requests').insert(payload);
console.log('Insert result:', insertErr ? `${insertErr.code}: ${insertErr.message}` : 'SUCCESS!');
