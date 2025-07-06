# VoteBrain

VoteBrain is a platform that helps voters make informed decisions by matching them with candidates and bills based on their values, providing lobbying data transparency, and connecting them with volunteer opportunities.

## Features

- 🗳️ **Values-based Matching**: See candidates and bills that align with your personal values
- 💰 **Lobbying Transparency**: Understand how money influences politics with detailed lobbying data
- 🤝 **Volunteer Opportunities**: Find ways to get involved that match your political interests
- 🎯 **Personalized Feed**: Swipe through news and political wins that matter to you
- 🔍 **Neutral Platform**: VoteBrain never tells you how to vote, it only computes alignment scores

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Vercel Serverless, Supabase, Auth.js
- **Database**: PostgreSQL with pgvector for similarity search
- **ETL**: Supabase Edge Functions, Scheduled Jobs
- **APIs**: ProPublica, OpenStates, OpenSecrets, Mobilize.us, Google Civic, OpenAI

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account
- API keys for various services

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/votebrain.git
cd votebrain
```

2. Install dependencies:

```bash
cd apps/web
npm install
```

3. Create a `.env.local` file based on `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-key
PROPUBLICA_API_KEY=your-propublica-key
OPENSTATES_API_KEY=your-openstates-key
GOOGLE_CIVIC_API_KEY=your-google-civic-key
NEWS_API_KEY=your-news-api-key
VOTEAMERICA_API_KEY=your-voteamerica-key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Setting Up Supabase

1. Create a new Supabase project
2. Run the schema migration from `apps/web/schema.sql`
3. Enable the pgvector extension
4. Set up authentication providers (Email, Google)
5. Create Edge Functions for ETL processes

### Running ETL Jobs

For local development, you can run the ETL jobs manually:

```bash
npm run etl:prime   # Load initial data
npm run fetch:orgs  # Update organization partisanship data
```

In production, these jobs are scheduled to run automatically.

## Deployment

### Vercel Deployment

1. Fork this repository to your GitHub account
2. Create a new project on Vercel
3. Connect your forked repository
4. Configure environment variables
5. Deploy!

### Supabase Setup

1. Create a new Supabase project
2. Copy the Supabase URL and anon key to Vercel environment variables
3. Run the SQL migration script
4. Set up edge functions and cron jobs

## Project Structure

```
/apps
  /web                 # Next.js application
    /app               # App router routes
    /components        # React components
    /utils             # Utility functions
    /supabase          # Supabase client and migrations
/packages
  /etl                 # ETL scripts and jobs
/docs                  # Documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

See [NOTICE.md](./NOTICE.md) for a list of open-source projects used in VoteBrain.