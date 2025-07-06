import axios from 'axios';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const tavily_api_key = process.env.TAVILY_API_KEY;
const openai_api_key = process.env.OPENAI_API_KEY;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Function to search Tavily for candidate information
async function searchCandidateInfo(candidateName: string, office: string, state: string) {
  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        query: `${candidateName} ${office} ${state} politics positions`,
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
    return [];
  }
}

// Function to search Tavily for bill information
async function searchBillInfo(billNumber: string, description: string) {
  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        query: `${billNumber} ${description} congress legislation`,
        search_depth: 'advanced',
        include_domains: ['congress.gov', 'govtrack.us', 'legiscan.com'],
        max_results: 3
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
    return [];
  }
}

// Function to extract issue positions from search results using OpenAI
async function extractIssuePositions(searchResults: any[]) {
  try {
    const context = searchResults
      .map(result => `Title: ${result.title}\nContent: ${result.content}`)
      .join('\n\n');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `Extract political positions on key issues from the provided text. 
            Return a JSON object with issue names as keys and positions as numeric values between -1 (strongly opposed) 
            and 1 (strongly supportive). Issues should include environment, healthcare, economy, education, immigration, 
            and any other relevant issues mentioned.`
          },
          {
            role: 'user',
            content: context
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
    return {};
  }
}

export async function searchAndSaveCandidates(supabase: any, candidates: any[]) {
  console.log('Searching and saving candidates...');
  
  for (const candidate of candidates) {
    console.log(`Processing candidate: ${candidate.name}`);
    
    // Search for candidate info
    const searchResults = await searchCandidateInfo(
      candidate.name,
      candidate.office,
      candidate.state || ''
    );
    
    // Extract issue positions
    const issuePositions = await extractIssuePositions(searchResults);
    
    // Update candidate record with issue positions
    const { error } = await supabase
      .from('candidates')
      .update({
        issue_positions: issuePositions,
        updated_at: new Date().toISOString()
      })
      .eq('id', candidate.id);
    
    if (error) {
      console.error(`Error updating candidate ${candidate.name}:`, error);
    } else {
      console.log(`Successfully updated candidate ${candidate.name}`);
    }
  }
}

export async function searchAndSaveBills(supabase: any, bills: any[]) {
  console.log('Searching and saving bills...');
  
  for (const bill of bills) {
    console.log(`Processing bill: ${bill.bill_number}`);
    
    // Search for bill info
    const searchResults = await searchBillInfo(
      bill.bill_number,
      bill.title
    );
    
    // Extract issue tags
    const issueTags = await extractIssuePositions(searchResults);
    
    // Update bill record with issue tags
    const { error } = await supabase
      .from('bills')
      .update({
        issue_tags: issueTags,
        updated_at: new Date().toISOString()
      })
      .eq('id', bill.id);
    
    if (error) {
      console.error(`Error updating bill ${bill.bill_number}:`, error);
    } else {
      console.log(`Successfully updated bill ${bill.bill_number}`);
    }
  }
}

export async function run(supabase: any) {
  // Get all candidates without issue positions
  const { data: candidates, error: candidatesError } = await supabase
    .from('candidates')
    .select('*')
    .is('issue_positions', null);
  
  if (candidatesError) {
    console.error('Error fetching candidates:', candidatesError);
  } else if (candidates.length > 0) {
    await searchAndSaveCandidates(supabase, candidates);
  }
  
  // Get all bills without issue tags
  const { data: bills, error: billsError } = await supabase
    .from('bills')
    .select('*')
    .is('issue_tags', null);
  
  if (billsError) {
    console.error('Error fetching bills:', billsError);
  } else if (bills.length > 0) {
    await searchAndSaveBills(supabase, bills);
  }
}