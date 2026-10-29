const SUPABASE_URL = 'https://ozvvxuzecwhlpbfongiy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jygIQlldUD1OOQ2cITnpkg_Sdw4OMVO';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

async function testColumns() {
  console.log('--- Testing columns on public.profiles ---');
  // Possible column names in profiles
  const possibleProfileCols = [
    'id', 'user_id', 'display_name', 'full_name', 'name', 'email', 'avatar_url', 'avatar',
    'photo_url', 'picture', 'image', 'preferred_language', 'language', 'default_response_language',
    'theme', 'role', 'is_admin', 'created_at', 'updated_at', 'phone', 'phone_number',
    'phone_country_code', 'country_code', 'accent_color', 'interface_density', 'font_size',
    'reduced_motion', 'subscription_plan', 'plan'
  ];

  for (const col of possibleProfileCols) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=${col}&limit=1`, { headers });
    const json = await res.json();
    if (res.status === 200 || res.status === 401) {
      // 401 means permission denied for anon, which means the column DOES exist!
      // 400 with "does not exist" means the column does NOT exist!
      if (res.status === 401) {
        console.log(`profiles.${col}: EXISTS (401 permission denied by RLS/privileges)`);
      } else {
        console.log(`profiles.${col}: EXISTS (200 OK)`);
      }
    } else {
      console.log(`profiles.${col}: ${res.status} -> ${json.message}`);
    }
  }

  console.log('\n--- Testing columns on public.support_requests ---');
  const possibleSupportCols = [
    'id', 'user_id', 'full_name', 'name', 'email', 'category', 'topic', 'subject', 'title',
    'message', 'content', 'description', 'status', 'priority', 'ticket_number', 'reference_number',
    'admin_notes', 'notes', 'resolution_notes', 'created_at', 'updated_at', 'resolved_at'
  ];

  for (const col of possibleSupportCols) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/support_requests?select=${col}&limit=1`, { headers });
    const json = await res.json();
    if (res.status === 200 || res.status === 401) {
      console.log(`support_requests.${col}: EXISTS (${res.status})`);
    } else {
      console.log(`support_requests.${col}: ${res.status} -> ${json.message}`);
    }
  }
}

testColumns().catch(console.error);
