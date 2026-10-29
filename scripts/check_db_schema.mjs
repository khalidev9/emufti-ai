const SUPABASE_URL = 'https://ozvvxuzecwhlpbfongiy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jygIQlldUD1OOQ2cITnpkg_Sdw4OMVO';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

async function check() {
  console.log('=== 1. Checking public.profiles columns ===');
  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=1`, { headers });
  const profJson = await profRes.json();
  console.log('profiles status:', profRes.status);
  console.log('profiles select *:', profJson);

  const colsToTest = ['id', 'user_id', 'full_name', 'email', 'avatar_url', 'phone_number', 'phone_country_code', 'preferred_language', 'subscription_plan', 'role'];
  for (const col of colsToTest) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=${col}&limit=1`, { headers });
    if (res.status === 200) {
      console.log(`Column profiles.${col}: EXISTS (200)`);
    } else {
      const err = await res.json();
      console.log(`Column profiles.${col}: MISSING or ERROR (${res.status}) ->`, err.message || err.code || err);
    }
  }

  console.log('\n=== 2. Checking support_requests table ===');
  const suppRes = await fetch(`${SUPABASE_URL}/rest/v1/support_requests?select=*&limit=1`, { headers });
  console.log('support_requests status:', suppRes.status);
  const suppJson = await suppRes.json();
  console.log('support_requests select *:', suppJson);

  console.log('\n=== 2b. Testing insert into support_requests ===');
  const testReq = {
    full_name: 'Diagnostic Test',
    email: 'test@example.com',
    category: 'other',
    subject: 'Testing support table',
    message: 'Automated test message to check table permissions and schema',
    status: 'pending',
    priority: 'medium',
    ticket_number: `TICK-TEST-${Date.now()}`
  };
  const insRes = await fetch(`${SUPABASE_URL}/rest/v1/support_requests`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(testReq)
  });
  console.log('support_requests insert status:', insRes.status);
  const insJson = await insRes.json();
  console.log('support_requests insert result:', insJson);

  console.log('\n=== 3. Checking Storage Buckets ===');
  const bucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, { headers });
  console.log('storage bucket status:', bucketRes.status);
  const bucketJson = await bucketRes.json();
  console.log('storage buckets:', bucketJson);

  console.log('\n=== 4. Checking admin or RPC or other tables ===');
  const tables = ['plan_requests', 'user_security_events', 'profiles'];
  for (const tbl of tables) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${tbl}?select=*&limit=1`, { headers });
    console.log(`table ${tbl} status:`, r.status);
  }
}

check().catch(console.error);
