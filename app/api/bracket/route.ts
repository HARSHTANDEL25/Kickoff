import { NextResponse } from 'next/server'

const COMPETITIONS: Record<string, { slug: string; rounds: { name: string; range: string }[] }> = {
    ucl: {
        slug: 'uefa.champions',
        rounds: [
            { name: 'Round of 16', range: '20260310-20260318' },
            { name: 'Quarter-finals', range: '20260407-20260416' },
            { name: 'Semi-finals', range: '20260428-20260507' },
            { name: 'Final', range: '20260530' },
        ],
    },
    uel: {
        slug: 'uefa.europa',
        rounds: [
            { name: 'Round of 16', range: '20260306-20260319' },
            { name: 'Quarter-finals', range: '20260403-20260417' },
            { name: 'Semi-finals', range: '20260424-20260508' },
            { name: 'Final', range: '20260520' },
        ],
    },
    uecl: {
        slug: 'uefa.europa.conf',
        rounds: [
            { name: 'Round of 16', range: '20260306-20260319' },
            { name: 'Quarter-finals', range: '20260403-20260417' },
            { name: 'Semi-finals', range: '20260424-20260508' },
            { name: 'Final', range: '20260527' },
        ],
    },
}

function parseMatches(events: any[]) {
    return events.map((event: any) => {
        const comp = event.competitions?.[0]
        const home = comp?.competitors?.find((c: any) => c.homeAway === 'home')
        const away = comp?.competitors?.find((c: any) => c.homeAway === 'away')
        return {
            id: event.id,
            date: event.date,
            home: { id: home?.team?.id, name: home?.team?.displayName || '', logo: home?.team?.logo || '', score: home?.score != null ? parseInt(home.score) : null },
            away: { id: away?.team?.id, name: away?.team?.displayName || '', logo: away?.team?.logo || '', score: away?.score != null ? parseInt(away.score) : null },
            completed: comp?.status?.type?.completed ?? false,
        }
    })
}

function aggregateTies(matches: any[]) {
    const ties: Record<string, any> = {}
    for (const m of matches) {
        const key = [m.home.id, m.away.id].sort().join('_')
        if (!ties[key]) {
            ties[key] = { home: m.home, away: m.away, homeScore: 0, awayScore: 0, legs: 0 }
        }
        const isHomeTeam = ties[key].home.id === m.home.id
        ties[key].homeScore += isHomeTeam ? (m.home.score ?? 0) : (m.away.score ?? 0)
        ties[key].awayScore += isHomeTeam ? (m.away.score ?? 0) : (m.home.score ?? 0)
        ties[key].legs++
    }
    return Object.values(ties).map(t => ({
        ...t,
        winner: t.homeScore > t.awayScore ? 'home' : t.awayScore > t.homeScore ? 'away' : null,
    }))
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const comp = searchParams.get('comp') ?? 'ucl'
    const competition = COMPETITIONS[comp]
    if (!competition) return NextResponse.json({ error: 'Unknown competition' }, { status: 400 })

    try {
        const rounds = await Promise.all(
            competition.rounds.map(async ({ name, range }) => {
                const res = await fetch(
                    `https://site.api.espn.com/apis/site/v2/sports/soccer/${competition.slug}/scoreboard?dates=${range}`,
                    { next: { revalidate: 3600 } }
                )
                const data = await res.json()
                const matches = parseMatches(data.events ?? [])
                const ties = name === 'Final' ? matches : aggregateTies(matches)
                return { name, ties }
            })
        )
        return NextResponse.json(rounds)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch bracket' }, { status: 500 })
    }
}
