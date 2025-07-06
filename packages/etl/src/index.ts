import dotenv from 'dotenv';
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Import ETL modules
import * as propublica from './propublica';
import * as openstates from './openstates';
import * as opensecrets from './opensecrets';
import * as embeddings from './embeddings';
import * as mobilize from './mobilize';
import * as news from './news';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Schedule ETL jobs
// Run ProPublica job at 2 AM every day
cron.schedule('0 2 * * *', async () => {
  console.log('Running ProPublica ETL job...');
  await propublica.run(supabase);
});

// Run OpenStates job at 3 AM every day
cron.schedule('0 3 * * *', async () => {
  console.log('Running OpenStates ETL job...');
  await openstates.run(supabase);
});

// Run OpenSecrets job at 4 AM every day
cron.schedule('0 4 * * *', async () => {
  console.log('Running OpenSecrets ETL job...');
  await opensecrets.run(supabase);
});

// Generate embeddings at 5 AM every day
cron.schedule('0 5 * * *', async () => {
  console.log('Generating embeddings...');
  await embeddings.run(supabase);
});

// Update Mobilize events every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Updating Mobilize events...');
  await mobilize.run(supabase);
});

// Update news feed every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Updating news feed...');
  await news.run(supabase);
});

console.log('ETL service started. Waiting for scheduled jobs...');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('ETL service stopping...');
  process.exit(0);
});