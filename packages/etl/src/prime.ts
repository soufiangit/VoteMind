import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function primeDatabase() {
  console.log('Starting database priming process...');
  
  try {
    // Step 1: Add sample candidates
    console.log('Adding sample candidates...');
    const { error: candidatesError } = await supabase.from('candidates').insert([
      {
        name: 'Jane Smith',
        office: 'Senate',
        party: 'Democratic',
        state: 'CA',
        bio: 'Jane Smith is a passionate advocate for environmental issues and social justice.',
        website_url: 'https://example.com/janesmith',
        issue_positions: {
          environment: 0.9,
          healthcare: 0.8,
          economy: 0.5,
          education: 0.7,
          immigration: 0.6
        }
      },
      {
        name: 'John Doe',
        office: 'House',
        party: 'Republican',
        state: 'TX',
        district: '12',
        bio: 'John Doe believes in small government and fiscal responsibility.',
        website_url: 'https://example.com/johndoe',
        issue_positions: {
          environment: 0.3,
          healthcare: 0.4,
          economy: 0.9,
          education: 0.5,
          immigration: 0.2
        }
      },
      {
        name: 'Maria Garcia',
        office: 'Governor',
        party: 'Independent',
        state: 'NY',
        bio: 'Maria Garcia is focused on economic development and education reform.',
        website_url: 'https://example.com/mariagarcia',
        issue_positions: {
          environment: 0.6,
          healthcare: 0.5,
          economy: 0.8,
          education: 0.9,
          immigration: 0.7
        }
      }
    ]);
    
    if (candidatesError) {
      console.error('Error adding candidates:', candidatesError);
    } else {
      console.log('Sample candidates added successfully');
    }
    
    // Step 2: Add sample bills
    console.log('Adding sample bills...');
    const { error: billsError } = await supabase.from('bills').insert([
      {
        bill_number: 'S.123',
        title: 'Clean Water Act Amendment',
        description: 'A bill to strengthen water quality standards and enforcement.',
        status: 'In Committee',
        introduced_date: '2025-01-15',
        chamber: 'Senate',
        federal: true,
        summary: 'This bill would increase funding for water quality monitoring and enforcement.',
        issue_tags: {
          environment: 0.9,
          health: 0.7,
          infrastructure: 0.5
        }
      },
      {
        bill_number: 'H.R.456',
        title: 'Tax Relief for Small Businesses',
        description: 'A bill to provide tax incentives for small business development.',
        status: 'Passed House',
        introduced_date: '2025-02-10',
        last_action_date: '2025-04-20',
        chamber: 'House',
        federal: true,
        summary: 'This bill would reduce taxes for businesses with fewer than 50 employees.',
        issue_tags: {
          economy: 0.9,
          small_business: 0.8,
          taxes: 0.9
        }
      },
      {
        bill_number: 'A.789',
        title: 'Education Funding Increase',
        description: 'A bill to increase state funding for public education.',
        status: 'Introduced',
        introduced_date: '2025-03-05',
        chamber: 'Assembly',
        state: 'NY',
        federal: false,
        summary: 'This bill would increase state education funding by 10% over the next five years.',
        issue_tags: {
          education: 0.9,
          budget: 0.7,
          children: 0.8
        }
      }
    ]);
    
    if (billsError) {
      console.error('Error adding bills:', billsError);
    } else {
      console.log('Sample bills added successfully');
    }
    
    // Step 3: Add sample inspiration posts
    console.log('Adding sample inspiration posts...');
    const { error: postsError } = await supabase.from('inspiration_posts').insert([
      {
        title: 'Historic Climate Bill Passes',
        summary: 'After years of advocacy, a landmark climate bill has passed, setting ambitious targets for carbon reduction.',
        source_url: 'https://example.com/climate-bill',
        published_date: '2025-05-01',
        topics: ['environment', 'legislation', 'climate'],
        importance_score: 0.9
      },
      {
        title: 'Local Community Revitalizes Park',
        summary: 'Volunteers come together to transform an abandoned lot into a thriving community garden and park.',
        source_url: 'https://example.com/community-park',
        published_date: '2025-04-28',
        topics: ['community', 'environment', 'local'],
        importance_score: 0.7
      },
      {
        title: 'New Voting Rights Protections Enacted',
        summary: 'Legislation expanding access to voting passes, ensuring more citizens can participate in democracy.',
        source_url: 'https://example.com/voting-rights',
        published_date: '2025-05-03',
        topics: ['voting', 'civil_rights', 'legislation'],
        importance_score: 0.85
      }
    ]);
    
    if (postsError) {
      console.error('Error adding inspiration posts:', postsError);
    } else {
      console.log('Sample inspiration posts added successfully');
    }
    
    console.log('Database priming completed successfully!');
    
  } catch (error) {
    console.error('Error during database priming:', error);
    process.exit(1);
  }
}

// Run the priming function
primeDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error during priming:', error);
    process.exit(1);
  });