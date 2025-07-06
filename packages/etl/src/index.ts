import dotenv from 'dotenv';
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Import ETL modules
import * as tavily from './tavily';
import * as openstates from './openstates';
import * as embeddings from './embeddings';
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
// Run Tavily job at 2 AM every day
cron.schedule('0 2 * * *', async () => {
  console.log('Running Tavily ETL job...');
  await tavily.run(supabase);
});

// Run OpenStates job at 3 AM every day
cron.schedule('0 3 * * *', async () => {
  console.log('Running OpenStates ETL job...');
  await openstates.run(supabase);
});

// Generate embeddings at 4 AM every day
cron.schedule('0 4 * * *', async () => {
  console.log('Generating embeddings...');
  await embeddings.run(supabase);
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