import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const league = new URL(request.url).searchParams.get('league') || 'eng.1'
    const base = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${id}`

    try {
        const [teamRes, rosterRes, scheduleRes] = await Promise.all([
            fetch(base, { next: { revalidate: 300 } }),
            fetch(`${base}/roster`, { next: { revalidate: 300 } }),
            fetch(`${base}/schedule`, { next: { revalidate: 300 } }),
        ])

        const [teamData, rosterData, scheduleData] = await Promise.all([
            teamRes.json(),
            rosterRes.json(),
            scheduleRes.json(),
        ])

        const t = teamData.team ?? {}
        const record = t.record?.items?.[0]
        const getStat = (name: string) => record?.stats?.find((s: any) => s.name === name)?.value ?? 0

        // Squad grouped by position
        const posOrder = ['G', 'D', 'M', 'F']
        const squad: Record<string, any[]> = { G: [], D: [], M: [], F: [] }
        for (const athlete of rosterData.athletes ?? []) {
            const pos = athlete.position?.abbreviation ?? 'F'
            const group = posOrder.find(p => pos.startsWith(p)) ?? 'F'
            squad[group].push({
                id: athlete.id,
                name: athlete.displayName,
                shortName: athlete.shortName,
                jersey: athlete.jersey ?? '',
                age: athlete.age ?? '',
                position: athlete.position?.displayName ?? '',
                posAbbr: athlete.position?.abbreviation ?? '',
                nationality: athlete.citizenship ?? '',
                flag: athlete.flag?.href ?? '',
                height: athlete.displayHeight ?? '',
                status: athlete.injuries?.[0]?.type?.abbreviation ?? '',
            })
        }

        // Schedule — split into results and upcoming
        const now = Date.now()
        const results: any[] = []
        const upcoming: any[] = []

        for (const event of scheduleData.events ?? []) {
            const comp = event.competitions?.[0]
            const home = comp?.competitors?.find((c: any) => c.homeAway === 'home')
            const away = comp?.competitors?.find((c: any) => c.homeAway === 'away')
            const isHome = home?.team?.id === id
            const opponent = isHome ? away : home
            const teamComp = isHome ? home : away
            const eventDate = new Date(event.date).getTime()
            const isPast = eventDate < now
            const homeScore = isPast ? (home?.score?.displayValue ?? home?.score ?? '') : ''
            const awayScore = isPast ? (away?.score?.displayValue ?? away?.score ?? '') : ''

            const entry = {
                id: event.id,
                date: event.date,
                opponent: opponent?.team?.displayName ?? '',
                opponentLogo: opponent?.team?.logo ?? '',
                isHome,
                teamScore: isHome ? homeScore : awayScore,
                opponentScore: isHome ? awayScore : homeScore,
                winner: isPast ? (teamComp?.winner ?? null) : null,
                competition: event.league?.abbreviation ?? event.league?.name ?? '',
            }

            if (isPast) {
                results.unshift(entry)
            } else {
                upcoming.push(entry)
            }
        }

        return NextResponse.json({
            team: {
                id,
                name: t.displayName ?? '',
                shortName: t.shortDisplayName ?? '',
                abbreviation: t.abbreviation ?? '',
                logo: t.logos?.[0]?.href ?? '',
                color: t.color ?? '09090b',
                altColor: t.alternateColor ?? '00F5D4',
                standing: t.standingSummary ?? '',
                record: {
                    summary: record?.summary ?? '',
                    wins: getStat('wins'),
                    draws: getStat('ties'),
                    losses: getStat('losses'),
                    points: getStat('points'),
                    goalsFor: getStat('pointsFor'),
                    goalsAgainst: getStat('pointsAgainst'),
                    rank: getStat('rank'),
                },
            },
            squad,
            results: results.slice(-5).reverse(),
            upcoming: upcoming.slice(0, 4),
        })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
    }
}
