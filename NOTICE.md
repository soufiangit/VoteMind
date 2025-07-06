# Open Source Attributions

VoteBrain uses the following open-source software components, which are licensed under the terms noted below:

## Next.js Subscription Payments Starter
- Source: https://github.com/vercel/nextjs-subscription-payments
- License: MIT
- Copyright: Vercel, Inc.
- Used for: Base application template, auth system, database integration
- Modifications: Removed Stripe payment functionality, added political profile features

## WeVote WebApp
- Source: https://github.com/wevote/WebApp
- License: Apache-2.0
- Used for: React ballot components
- Modifications: Dropping Flux, wiring to React Context; replacing endorsement logic with cosine similarity

## Supabase Vector Search
- Source: https://github.com/supabase/nextjs-vector-search
- License: MIT
- Used for: Vector embeddings for candidate/bill similarity
- Modifications: Adapted for candidate/bill matching, added lobby_penalty dimension

## OpenSecrets Scraper
- Source: https://github.com/opensecrets-scraper
- License: BSD-3-Clause
- Used for: Lobby money ETL
- Modifications: Adapted for Edge Function loading of lobby_contribs, candidate_cycle_totals

## FEC OpenFEC client
- Source: https://github.com/fecgov/openFEC
- License: CC-0
- Used for: Campaign finance data
- Modifications: Computing lobby_penalty

## Mobilize.us API
- Source: https://github.com/mobilizeamerica/api
- License: Apache-2.0
- Used for: Volunteer events API
- Modifications: Added caching and partisan filtering

## Smooth-Continuous-Vertical-Swiper
- Source: https://github.com/smooth-continuous-vertical-swiper
- License: MIT
- Used for: Inspiration swipe feed
- Modifications: Integrated with Supabase posts

## news-summarizer
- Source: https://github.com/news-summarizer
- License: MIT
- Used for: News content for inspiration feed
- Modifications: Integrated with OpenAI for summaries, added tag-matching

## OpenStates GraphQL
- Source: https://github.com/openstates/openstates-graphql
- License: Apache-2.0
- Used for: State & local bills data
- Modifications: ETL into state_bills table

## Supabase civic-info
- Source: https://gist.github.com/supabase/civic-info
- License: MIT
- Used for: Polling & voter resources
- Modifications: Created raw Google Civic JSON route