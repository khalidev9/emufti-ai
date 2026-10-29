import { createClient } from '@supabase/supabase-js';

const url = 'https://ozvvxuzecwhlpbfongiy.supabase.co';
const anonKey = 'sb_publishable_jygIQlldUD1OOQ2cITnpkg_Sdw4OMVO';

const client = createClient(url, anonKey);

async function test() {
  console.log('Testing connection to Supabase support_requests...');
  try {
    const { data, error } = await client.from('support_requests').select('*').limit(5);
    if (error) {
      console.error('Error selecting from support_requests:', error);
    } else {
      console.log('Success selecting from support_requests, count:', data?.length);
      console.log('Sample rows:', data);
    }

    // Also test inserting a test request
    const testRef = 'SR-TEST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Testing inserting support request with reference:', testRef);
    const { data: insertData, error: insertError } = await client.from('support_requests').insert({
      reference_id: testRef,
      full_name: 'Test Submitter',
      email: 'test@example.com',
      phone: '+252615000000',
      subject: 'Test Subject',
      description: 'This is an automated test of the support request submission system.',
      status: 'submitted',
    }).select().single();

    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('Insert success! Inserted record:', insertData);

      // Clean up test record if possible
      const { error: delError } = await client.from('support_requests').delete().eq('reference_id', testRef);
      if (delError) {
        console.log('Note: delete restricted by RLS (expected for anon users):', delError.message);
      } else {
        console.log('Cleaned up test record.');
      }
    }
  } catch (err) {
    console.error('Exception querying support_requests:', err);
  }
}

test();
