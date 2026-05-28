import { NextResponse } from 'next/server'

const LEAGUES = [
    { slug: 'eng.1', name: 'Premier League' },
    { slug: 'esp.1', name: 'La Liga' },
    { slug: 'ita.1', name: 'Serie A' },
    { slug: 'ger.1', name: 'Bundesliga' },
    { slug: 'fra.1', name: 'Ligue 1' },
]

export async function GET() {
    try {
        const results = await Promise.allSettled(
            LEAGUES.map(async ({ slug, name }) => {
                const res = await fetch(
                    `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/teams`,
                    { next: { revalidate: 3600 } }
                )
                const data = await res.json()
                const teams = (data.sports?.[0]?.leagues?.[0]?.teams ?? []).map((t: any) => ({
                    id: t.team.id,
                    name: t.team.displayName,
                    shortName: t.team.shortDisplayName,
                    logo: t.team.logos?.[0]?.href ?? '',
                    color: t.team.color ?? '',
                    slug,
                }))
                return { league: name, slug, teams }
            })
        )

        const leagues = results
            .filter(r => r.status === 'fulfilled')
            .map(r => (r as PromiseFulfilledResult<any>).value)
            .filter(l => l.teams.length > 0)

        return NextResponse.json(leagues)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }
}
