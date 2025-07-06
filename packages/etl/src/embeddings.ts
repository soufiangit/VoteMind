import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const openai_api_key = process.env.OPENAI_API_KEY;

// Function to generate embeddings using OpenAI
async function generateEmbedding(text: string) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: 'text-embedding-ada-002'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openai_api_key}`
        }
      }
    );

    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

// Function to generate embeddings for candidates
async function generateCandidateEmbeddings(supabase: any) {
  console.log('Generating embeddings for candidates...');
  
  // Get candidates without embeddings but with issue positions
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('*')
    .is('embedding', null)
    .not('issue_positions', 'is', null);
  
  if (error) {
    console.error('Error fetching candidates:', error);
    return;
  }
  
  console.log(`Found ${candidates?.length || 0} candidates without embeddings`);
  
  for (const candidate of candidates || []) {
    console.log(`Processing candidate: ${candidate.name}`);
    
    // Convert issue positions to text for embedding
    const issueText = Object.entries(candidate.issue_positions)
      .map(([issue, value]) => `${issue}: ${value}`)
      .join(', ');
    
    // Generate embedding
    const embedding = await generateEmbedding(issueText);
    
    if (embedding) {
      // Update candidate with embedding
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ embedding })
        .eq('id', candidate.id);
      
      if (updateError) {
        console.error(`Error updating candidate ${candidate.name}:`, updateError);
      } else {
        console.log(`Successfully updated embedding for candidate ${candidate.name}`);
      }
    }
  }
}

// Function to generate embeddings for bills
async function generateBillEmbeddings(supabase: any) {
  console.log('Generating embeddings for bills...');
  
  // Get bills without embeddings but with issue tags
  const { data: bills, error } = await supabase
    .from('bills')
    .select('*')
    .is('embedding', null)
    .not('issue_tags', 'is', null);
  
  if (error) {
    console.error('Error fetching bills:', error);
    return;
  }
  
  console.log(`Found ${bills?.length || 0} bills without embeddings`);
  
  for (const bill of bills || []) {
    console.log(`Processing bill: ${bill.bill_number}`);
    
    // Convert issue tags to text for embedding
    const issueText = Object.entries(bill.issue_tags)
      .map(([issue, value]) => `${issue}: ${value}`)
      .join(', ');
    
    // Generate embedding
    const embedding = await generateEmbedding(issueText);
    
    if (embedding) {
      // Update bill with embedding
      const { error: updateError } = await supabase
        .from('bills')
        .update({ embedding })
        .eq('id', bill.id);
      
      if (updateError) {
        console.error(`Error updating bill ${bill.bill_number}:`, updateError);
      } else {
        console.log(`Successfully updated embedding for bill ${bill.bill_number}`);
      }
    }
  }
}

// Function to generate embeddings for inspiration posts
async function generateInspirationEmbeddings(supabase: any) {
  console.log('Generating embeddings for inspiration posts...');
  
  // Get posts without embeddings
  const { data: posts, error } = await supabase
    .from('inspiration_posts')
    .select('*')
    .is('embedding', null);
  
  if (error) {
    console.error('Error fetching inspiration posts:', error);
    return;
  }
  
  console.log(`Found ${posts?.length || 0} inspiration posts without embeddings`);
  
  for (const post of posts || []) {
    console.log(`Processing post: ${post.title}`);
    
    // Create text for embedding from title, summary and topics
    const postText = `${post.title}. ${post.summary}. Topics: ${Array.isArray(post.topics) ? post.topics.join(', ') : ''}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(postText);
    
    if (embedding) {
      // Update post with embedding
      const { error: updateError } = await supabase
        .from('inspiration_posts')
        .update({ embedding })
        .eq('id', post.id);
      
      if (updateError) {
        console.error(`Error updating post ${post.title}:`, updateError);
      } else {
        console.log(`Successfully updated embedding for post ${post.title}`);
      }
    }
  }
}

export async function run(supabase: any) {
  if (!openai_api_key) {
    console.error('Missing OpenAI API key. Please check your environment variables.');
    return;
  }
  
  await generateCandidateEmbeddings(supabase);
  await generateBillEmbeddings(supabase);
  await generateInspirationEmbeddings(supabase);
  
  console.log('Embedding generation completed.');
}