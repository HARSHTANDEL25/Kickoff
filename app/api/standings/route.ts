import { NextResponse } from 'next/server'

const LEAGUES: Record<string, string> = {
    pl: 'eng.1',
    laliga: 'esp.1',
    seriea: 'ita.1',
    bundesliga: 'ger.1',
    ligue1: 'fra.1',
    ucl: 'uefa.champions',
    uel: 'uefa.europa',
    uecl: 'uefa.europa.conf',
}

const getStat = (stats: any[], abbr: string): number => {
    const val = stats.find((s: any) => s.abbreviation === abbr)?.value
    return typeof val === 'number' ? val : parseInt(val) || 0
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league') ?? 'pl'
    const slug = LEAGUES[league] ?? 'eng.1'

    try {
        const res = await fetch(
            `https://site.web.api.espn.com/apis/v2/sports/soccer/${slug}/standings`,
            { next: { revalidate: 3600 } }
        )
        const data = await res.json()
        const entries = data.children?.[0]?.standings?.entries ?? []

        const standings = entries.map((entry: any) => ({
            rank: getStat(entry.stats, 'R'),
            team: {
                id: entry.team?.id,
                name: entry.team?.displayName || entry.team?.name || '',
                logo: entry.team?.logos?.[0]?.href || '',
            },
            points: getStat(entry.stats, 'P'),
            goalsDiff: getStat(entry.stats, 'GD'),
            all: {
                played: getStat(entry.stats, 'GP'),
                win: getStat(entry.stats, 'W'),
                draw: getStat(entry.stats, 'D'),
                lose: getStat(entry.stats, 'L'),
            },
            form: '',
        }))

        return NextResponse.json(standings)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 })
    }
}
