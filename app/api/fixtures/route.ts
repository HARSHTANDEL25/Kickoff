import { NextResponse } from 'next/server'

const ESPN_LEAGUES = [
    { slug: 'eng.1', name: 'Premier League', country: 'England' },
    { slug: 'esp.1', name: 'La Liga', country: 'Spain' },
    { slug: 'ita.1', name: 'Serie A', country: 'Italy' },
    { slug: 'ger.1', name: 'Bundesliga', country: 'Germany' },
    { slug: 'fra.1', name: 'Ligue 1', country: 'France' },
    { slug: 'uefa.champions', name: 'Champions League', country: 'Europe' },
    { slug: 'uefa.europa', name: 'Europa League', country: 'Europe' },
    { slug: 'uefa.europa.conf', name: 'Conference League', country: 'Europe' },
    { slug: 'fifa.world', name: 'World Cup', country: 'International' },
]

function mapStatus(name: string, period: number): string {
    if (name === 'STATUS_HALFTIME') return 'HT'
    if (name === 'STATUS_FINAL' || name === 'STATUS_FULL_TIME') return 'FT'
    if (name === 'STATUS_IN_PROGRESS') return period <= 1 ? '1H' : '2H'
    if (name === 'STATUS_POSTPONED') return 'PST'
    return 'NS'
}

function mapEvent(event: any, league: typeof ESPN_LEAGUES[0]) {
    const comp = event.competitions?.[0]
    if (!comp) return null
    const home = comp.competitors?.find((c: any) => c.homeAway === 'home')
    const away = comp.competitors?.find((c: any) => c.homeAway === 'away')
    const status = comp.status

    return {
        fixture: {
            id: event.id,
            date: event.date,
            status: {
                long: status?.type?.description || '',
                short: mapStatus(status?.type?.name || '', status?.period || 0),
                elapsed: status?.displayClock ? parseInt(status.displayClock) || null : null,
            },
            venue: {
                name: comp.venue?.fullName || '',
                city: comp.venue?.address?.city || '',
            },
        },
        league: {
            name: league.name,
            country: league.country,
            logo: '',
            round: comp.notes?.[0]?.headline || '',
        },
        teams: {
            home: {
                id: home?.team?.id,
                name: home?.team?.displayName || home?.team?.name || '',
                logo: home?.team?.logo || '',
                winner: home?.winner ?? null,
            },
            away: {
                id: away?.team?.id,
                name: away?.team?.displayName || away?.team?.name || '',
                logo: away?.team?.logo || '',
                winner: away?.winner ?? null,
            },
        },
        goals: {
            home: home?.score != null ? parseInt(home.score) : null,
            away: away?.score != null ? parseInt(away.score) : null,
        },
    }
}

export async function GET() {
    try {
        const results = await Promise.allSettled(
            ESPN_LEAGUES.map(league =>
                fetch(
                    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.slug}/scoreboard`,
                    { next: { revalidate: 30 } }
                )
                    .then(res => res.json())
                    .then(data => (data.events ?? []).map((e: any) => mapEvent(e, league)).filter(Boolean))
            )
        )

        const fixtures = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => (r as PromiseFulfilledResult<any[]>).value)
            .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())

        return NextResponse.json(fixtures)

    } catch {
        return NextResponse.json({ error: 'Failed to fetch fixtures' }, { status: 500 })
    }
}
