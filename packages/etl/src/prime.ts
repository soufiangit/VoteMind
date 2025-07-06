import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tavily_api_key = process.env.TAVILY_API_KEY;
const openai_api_key = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

if (!tavily_api_key) {
  console.warn('Warning: Missing Tavily API key. Some features will be limited.');
}

if (!openai_api_key) {
  console.warn('Warning: Missing OpenAI API key. Some features will be limited.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to search for candidate information using Tavily
async function searchCandidateInfo(candidate: any) {
  if (!tavily_api_key) return null;

  try {
    console.log(`Searching for information on ${candidate.name}...`);
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        query: `${candidate.name} ${candidate.office} ${candidate.state || ''} politics positions`,
        search_depth: 'advanced',
        include_domains: ['ballotpedia.org', 'votesmart.org', 'opensecrets.org', 'ontheissues.org'],
        max_results: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': tavily_api_key
        }
      }
    );

    return response.data.results;
  } catch (error) {
    console.error('Error searching Tavily:', error);
    return null;
  }
}

// Function to extract issue positions using OpenAI
async function extractIssuePositions(searchResults: any[]) {
  if (!openai_api_key || !searchResults) return null;

  try {
    const context = searchResults
      .map(result => `Title: ${result.title}\nContent: ${result.content}`)
      .join('\n\n');

    console.log('Extracting issue positions...');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Extract political positions on key issues from the provided text. 
            Return a JSON object with issue names as keys and positions as numeric values between -1 (strongly opposed) 
            and 1 (strongly supportive). Issues should include environment, healthcare, economy, education, immigration.`
          },
          {
            role: 'user',
            content: context || "No content available. Please generate reasonable default positions."
          }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openai_api_key}`
        }
      }
    );

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error extracting positions with OpenAI:', error);
    return null;
  }
}

async function primeDatabase() {
  console.log('Starting database priming process...');
  
  try {
    // Step 1: Add sample candidates
    console.log('Adding sample candidates...');
    
    const candidates = [
      {
        name: 'Jane Smith',
        office: 'Senate',
        party: 'Democratic',
        state: 'CA',
        bio: 'Jane Smith is a passionate advocate for environmental issues and social justice.',
        website_url: 'https://example.com/janesmith',
      },
      {
        name: 'John Doe',
        office: 'House',
        party: 'Republican',
        state: 'TX',
        district: '12',
        bio: 'John Doe believes in small government and fiscal responsibility.',
        website_url: 'https://example.com/johndoe',
      },
      {
        name: 'Maria Garcia',
        office: 'Governor',
        party: 'Independent',
        state: 'NY',
        bio: 'Maria Garcia is focused on economic development and education reform.',
        website_url: 'https://example.com/mariagarcia',
      }
    ];
    
    for (const candidate of candidates) {
      // Check if candidate already exists
      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('name', candidate.name)
        .maybeSingle();
      
      if (existingCandidate) {
        console.log(`Candidate already exists: ${candidate.name}`);
        continue;
      }
      
      // Add basic candidate info
      const { data: newCandidate, error: insertError } = await supabase
        .from('candidates')
        .insert(candidate)
        .select();
      
      if (insertError) {
        console.error(`Error adding candidate ${candidate.name}:`, insertError);
        continue;
      }
      
      console.log(`Added candidate: ${candidate.name}`);
      
      // Try to enrich with Tavily and OpenAI if available
      if (tavily_api_key && openai_api_key) {
        const searchResults = await searchCandidateInfo(candidate);
        
        if (searchResults && searchResults.length > 0) {
          const issuePositions = await extractIssuePositions(searchResults);
          
          if (issuePositions) {
            // Update candidate with issue positions
            const { error: updateError } = await supabase
              .from('candidates')
              .update({
                issue_positions: issuePositions,
                updated_at: new Date().toISOString()
              })
              .eq('id', newCandidate[0].id);
            
            if (updateError) {
              console.error(`Error updating candidate ${candidate.name}:`, updateError);
            } else {
              console.log(`Updated issue positions for candidate: ${candidate.name}`);
            }
          }
        }
      } else {
        // Add default issue positions
        const { error: updateError } = await supabase
          .from('candidates')
          .update({
            issue_positions: {
              environment: candidate.party === 'Democratic' ? 0.8 : candidate.party === 'Republican' ? -0.3 : 0.4,
              healthcare: candidate.party === 'Democratic' ? 0.7 : candidate.party === 'Republican' ? -0.5 : 0.3,
              economy: candidate.party === 'Democratic' ? 0.4 : candidate.party === 'Republican' ? 0.8 : 0.6,
              education: candidate.party === 'Democratic' ? 0.7 : candidate.party === 'Republican' ? 0.3 : 0.8,
              immigration: candidate.party === 'Democratic' ? 0.6 : candidate.party === 'Republican' ? -0.4 : 0.1
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', newCandidate[0].id);
        
        if (updateError) {
          console.error(`Error updating candidate ${candidate.name}:`, updateError);
        } else {
          console.log(`Added default issue positions for candidate: ${candidate.name}`);
        }
      }
    }
    
    // Step 2: Add sample bills
    console.log('Adding sample bills...');
    const bills = [
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
    ];
    
    for (const bill of bills) {
      // Check if bill already exists
      const { data: existingBill } = await supabase
        .from('bills')
        .select('id')
        .eq('bill_number', bill.bill_number)
        .maybeSingle();
      
      if (existingBill) {
        console.log(`Bill already exists: ${bill.bill_number}`);
        continue;
      }
      
      // Add bill
      const { error: billError } = await supabase
        .from('bills')
        .insert(bill);
      
      if (billError) {
        console.error(`Error adding bill ${bill.bill_number}:`, billError);
      } else {
        console.log(`Added bill: ${bill.bill_number}`);
      }
    }
    
    // Step 3: Add sample inspiration posts
    console.log('Adding sample inspiration posts...');
    const posts = [
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
    ];
    
    for (const post of posts) {
      // Check if post already exists
      const { data: existingPost } = await supabase
        .from('inspiration_posts')
        .select('id')
        .eq('title', post.title)
        .maybeSingle();
      
      if (existingPost) {
        console.log(`Post already exists: ${post.title}`);
        continue;
      }
      
      // Add post
      const { error: postError } = await supabase
        .from('inspiration_posts')
        .insert(post);
      
      if (postError) {
        console.error(`Error adding post ${post.title}:`, postError);
      } else {
        console.log(`Added post: ${post.title}`);
      }
    }
    
    // Step 4: Generate embeddings if OpenAI API key is available
    if (openai_api_key) {
      console.log('Generating embeddings...');
      
      // Create a webhook call to trigger embedding generation
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhooks`,
          {
            type: 'etl.embeddings.generate',
            data: {}
          }
        );
        console.log('Webhook triggered for embedding generation');
      } catch (error) {
        console.error('Error triggering embedding generation:', error);
      }
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