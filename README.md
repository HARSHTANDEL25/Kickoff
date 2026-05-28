# KickOff

A premium football dashboard for the community — live scores, standings, team info, match details, transfers, and news across the top 5 European leagues and UEFA competitions.

Live: [kickoff-tau.vercel.app](https://kickoff-tau.vercel.app)

---

## Features

- **Live Scores** — real-time match cards with scores, status, and league badges
- **Leagues** — standings table for PL, La Liga, Serie A, Bundesliga, Ligue 1 + knockout brackets for UCL, UEL, UECL
- **Teams** — browse all ~100 clubs by league, search across all of them, view squad, results, and upcoming fixtures
- **Match Detail** — head-to-head record, recent form, season stats comparison
- **Transfers** — latest transfer news and rumours
- **News** — aggregated football-only news from BBC Sport, Sky Sports, ESPN FC, Guardian, Goal.com, Marca, and more

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Data**: ESPN unofficial API + RSS feeds
- **Deployment**: Vercel

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── api/              # API routes (ESPN proxy + RSS aggregation)
│   ├── fixtures/     # Live and upcoming fixtures
│   ├── standings/    # League tables
│   ├── bracket/      # UCL/UEL/UECL knockout brackets
│   ├── teams/        # All teams by league
│   ├── team/[id]/    # Team detail (squad, results, fixtures)
│   ├── match/[id]/   # Match detail (H2H, form, stats)
│   ├── transfers/    # Transfer news
│   └── news/         # Aggregated news
├── components/
│   ├── layout/       # Navigation (desktop + mobile), footer
│   └── ui/           # MatchCard, StandingsTable, KnockoutBracket, etc.
├── lib/
│   └── data/         # Navigation links, league slug mappings
├── leagues/          # Leagues page
├── live/             # Live scores page
├── teams/            # Teams directory
├── team/[id]/        # Team detail page
├── match/[id]/       # Match detail page
├── transfers/        # Transfers page
└── news/             # News page
```

---

## Data Sources

All data is fetched from ESPN's public APIs and public RSS feeds. No API key required.

- Scores & fixtures: `site.api.espn.com`
- News: BBC Sport, Sky Sports, Guardian, ESPN FC, Goal.com, Marca, Football Italia

---

## Roadmap (Post-MVP)

- [ ] Match events timeline (goals, cards, substitutions)
- [ ] Follow teams / personalised home feed
- [ ] Error boundaries for ESPN downtime
- [ ] PWA with push notifications for live goals
- [ ] Global Cmd+K search across teams, matches, and news
