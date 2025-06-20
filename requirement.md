# Broadway Community Platform Requirements

## Project Overview
Build a community-driven Broadway ticket search platform that helps people understand the confusing ticket landscape. Focus on education and transparency, not just aggregation.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Neon PostgreSQL
- Vercel for deployment

## Core Features for MVP

### 1. Educational Homepage
- Hero section explaining the platform's purpose
- "New to Broadway?" section with 3-4 guide cards
- Community feed (Reddit embed initially)
- Search bar to find shows

### 2. Show Search & Display
- Search shows by name
- Show page displays:
  - Available tickets from multiple sources
  - Visual theater seating chart
  - Section explanations
  - Price comparison table
  - Community tips

### 3. Static Educational Content
- /guides/first-time-buyer
- /guides/seating-explained
- /guides/when-to-buy

### 4. Data Sources (Phase 1)
- TKTS live inventory
- Theatr app
- Manual data for theater layouts

## Database Schema
- shows (id, name, slug, theater, fun_fact, newbie_tip)
- listings (id, show_id, source, date, time, section, price, url, last_seen)
- community_tips (id, show_id, tip_type, content, upvotes)

## Design Principles
- Mobile-first
- Clear, friendly language (no jargon)
- Transparency about data sources and freshness
- Educational over transactional

## NOT needed for MVP
- User accounts
- Payment processing
- Complex animations
- Admin panel (use Neon console)