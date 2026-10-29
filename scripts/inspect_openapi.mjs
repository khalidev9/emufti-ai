const SUPABASE_URL = 'https://ozvvxuzecwhlpbfongiy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jygIQlldUD1OOQ2cITnpkg_Sdw4OMVO';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Accept': 'application/openapi+json'
};

async function inspectSchema() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, { headers });
  console.log('OpenAPI fetch status:', res.status);
  const spec = await res.json();
  
  if (spec.definitions) {
    console.log('Available tables in OpenAPI spec:');
    for (const [name, def] of Object.entries(spec.definitions)) {
      console.log(`\n--- TABLE: ${name} ---`);
      if (def.properties) {
        console.log('Columns:', Object.keys(def.properties));
        for (const [propName, propDef] of Object.entries(def.properties)) {
          console.log(`  ${propName}: type=${propDef.type}, format=${propDef.format || ''}, description=${propDef.description || ''}`);
        }
      }
    }
  } else {
    console.log('No definitions in OpenAPI spec. Keys:', Object.keys(spec));
  }
}

inspectSchema().catch(console.error);
