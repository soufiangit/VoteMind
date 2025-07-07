# VoteBrain
I worked in nonpartisan canvassing for two years. And what I saw the most, is that people did not know who to vote for. And because I had to remain nonpartisan, I could not provide that information. This project, VoteBrain, changes that.

VoteBrain is a platform that helps voters make informed decisions by matching them with candidates and bills based on their values, providing lobbying data transparency, and connecting them with volunteer opportunities, while remaining nonpartisan, and informative.

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
- **APIs**:  OpenStates, OpenSecrets, Google Civic, OpenAI


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