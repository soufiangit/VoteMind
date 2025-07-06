import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const news_api_key = process.env.NEWS_API_KEY;
const openai_api_key = process.env.OPENAI_API_KEY;

// Function to fetch news articles from News API
async function fetchNewsArticles() {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'politics OR democracy OR voting OR election positive OR success OR win OR progress',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey: news_api_key
      }
    });

    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return [];
  }
}

// Function to generate a summary for an article using OpenAI
async function generateSummary(article: any) {
  try {
    const prompt = `
    Article Title: ${article.title}
    Article URL: ${article.url}
    Article Content: ${article.content || article.description}
    
    Please provide a brief, positive summary of this political news article in 2-3 sentences.
    Focus on the positive achievements, progress, or inspirational aspects.
    `;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that creates brief, inspiring summaries of political news articles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openai_api_key}`
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return article.description || 'No summary available.';
  }
}

// Function to extract topics from an article using OpenAI
async function extractTopics(article: any) {
  try {
    const prompt = `
    Article Title: ${article.title}
    Article URL: ${article.url}
    Article Content: ${article.content || article.description}
    
    Please extract 3-5 relevant political topics or issues from this article.
    Return them as a JSON array of strings.
    `;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that extracts political topics from news articles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 150
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openai_api_key}`
        }
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);
    return result.topics || [];
  } catch (error) {
    console.error('Error extracting topics:', error);
    return ['politics'];
  }
}

// Function to calculate importance score based on topics and recency
function calculateImportanceScore(article: any, topics: string[]) {
  // More topics = higher score
  const topicScore = Math.min(topics.length / 5, 1) * 0.4;
  
  // More recent = higher score
  const publishedDate = new Date(article.publishedAt);
  const now = new Date();
  const daysDiff = Math.ceil((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
  const recencyScore = Math.max(0, 1 - daysDiff / 30) * 0.6;
  
  // Combine scores
  return topicScore + recencyScore;
}

export async function run(supabase: any) {
  if (!news_api_key) {
    console.error('Missing News API key. Please check your environment variables.');
    return;
  }
  
  if (!openai_api_key) {
    console.error('Missing OpenAI API key. Please check your environment variables.');
    return;
  }
  
  console.log('Fetching news articles...');
  const articles = await fetchNewsArticles();
  console.log(`Found ${articles.length} articles`);
  
  for (const article of articles) {
    console.log(`Processing article: ${article.title}`);
    
    // Check if article already exists in the database
    const { data: existingArticle } = await supabase
      .from('inspiration_posts')
      .select('id')
      .eq('source_url', article.url)
      .maybeSingle();
    
    if (existingArticle) {
      console.log(`Article already exists: ${article.title}`);
      continue;
    }
    
    // Generate summary
    const summary = await generateSummary(article);
    
    // Extract topics
    const topics = await extractTopics(article);
    
    // Calculate importance score
    const importanceScore = calculateImportanceScore(article, topics);
    
    // Insert article into database
    const { error } = await supabase
      .from('inspiration_posts')
      .insert({
        title: article.title,
        summary,
        source_url: article.url,
        image_url: article.urlToImage,
        published_date: article.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : null,
        topics,
        importance_score: importanceScore,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error(`Error inserting article ${article.title}:`, error);
    } else {
      console.log(`Successfully inserted article: ${article.title}`);
    }
  }
  
  console.log('News processing completed.');
}