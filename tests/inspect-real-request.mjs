import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let url = '';
let key = '';
for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    url = line.split('=')[1].trim();
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    key = line.split('=')[1].trim();
  }
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

console.log('Inspecting real request REQ-EMUFTI-88WDER...');

// 1. Check using get_plan_request_status RPC
const { data: trackingRpc, error: trackingRpcErr } = await supabase.rpc('get_plan_request_status', {
  p_reference_id: 'REQ-EMUFTI-88WDER'
});
console.log('get_plan_request_status result:', { data: trackingRpc, error: trackingRpcErr });

// 2. Check using plan_request_tracking view
const { data: viewData, error: viewErr } = await supabase
  .from('plan_request_tracking')
  .select('*')
  .eq('reference_id', 'REQ-EMUFTI-88WDER');
console.log('plan_request_tracking view result:', { data: viewData, error: viewErr });

// 3. Try to select directly from plan_requests
const { data: prData, error: prErr } = await supabase
  .from('plan_requests')
  .select('*')
  .or('reference_id.eq.REQ-EMUFTI-88WDER,email.eq.jaamac45@gmail.com');
console.log('plan_requests direct result:', { data: prData, error: prErr });

// 4. Try to select from profiles for jaamac45@gmail.com
const { data: profData, error: profErr } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', 'jaamac45@gmail.com');
console.log('profiles result:', { data: profData, error: profErr });

// 5. Try to select all from plan_request_tracking
const { data: allTracking, error: allTrackingErr } = await supabase
  .from('plan_request_tracking')
  .select('*');
console.log('all plan_request_tracking rows:', { count: allTracking?.length, data: allTracking, error: allTrackingErr });
