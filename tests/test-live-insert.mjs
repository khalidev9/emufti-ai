import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), '');
const url = (env.VITE_SUPABASE_URL || '').trim();
const key = (env.VITE_SUPABASE_ANON_KEY || '').trim();

const supabase = createClient(url, key, { auth: { persistSession: false } });

console.log('Testing inserting a plan request to live Supabase...');
const testRef = `REQ-EMUFTI-${Date.now().toString().slice(-6)}`;
const payload = {
  reference_id: testRef,
  full_name: 'Ahmed Seeker',
  email: 'ahmed.seeker@example.com',
  whatsapp: '+252615112233',
  plan: 'pro',
  status: 'pending',
};

const { data, error } = await supabase
  .from('plan_requests')
  .insert(payload)
  .select();

console.log('Insert response:', { data, error });
