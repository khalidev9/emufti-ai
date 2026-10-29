import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let url = '';
let key = '';
for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Check what RPCs respond or error
async function testRpc(name, params) {
  const { data, error } = await supabase.rpc(name, params);
  console.log(`RPC [${name}]:`, { error_code: error?.code, error_msg: error?.message, hint: error?.hint });
}

await testRpc('is_admin', {});
await testRpc('update_plan_request_status', { p_request_id: '00000000-0000-0000-0000-000000000000', p_status: 'approved' });
await testRpc('get_plan_request_status', { p_reference_id: 'REQ-EMUFTI-88WDER' });
