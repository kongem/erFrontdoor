const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be defined.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  const filePath = path.join(__dirname, '..', 'data', 'feedback.json');
  if (!fs.existsSync(filePath)) {
    console.error('Local data file not found at:', filePath);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const logs = JSON.parse(fileContent);

  console.log(`Found ${logs.length} logs in local database. Seeding to Supabase...`);

  // Clear existing logs in Supabase
  const { error: deleteError } = await supabase.from('logs').delete().neq('id', 'placeholder');
  if (deleteError) {
    console.warn('Note: Failed to clear existing database (table might be empty or missing):', deleteError.message);
  }

  // Insert records
  for (const log of logs) {
    const id = log.id;
    const timestamp = log.timestamp;
    const type = log.type;
    const refId = log.refId || null;

    const cleanData = { ...log };
    delete cleanData.id;
    delete cleanData.timestamp;
    delete cleanData.type;
    delete cleanData.refId;

    const { error } = await supabase.from('logs').insert({
      id,
      timestamp,
      type,
      ref_id: refId,
      data: cleanData,
    });

    if (error) {
      console.error(`Failed to insert log ${id}:`, error.message);
    } else {
      console.log(`Seeded log: ${id} (${type})`);
    }
  }

  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Unhandled seeding error:', err);
  process.exit(1);
});
