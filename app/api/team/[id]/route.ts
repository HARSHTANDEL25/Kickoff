import { NextResponse } from 'next/server'

const DOMESTIC_LEAGUES = ['eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1']
const COMPETITION_LEAGUES = ['uefa.champions', 'uefa.europa', 'uefa.europa.conf', 'fifa.world']

async function resolveDomesticLeague(id: string): Promise<{ league: string; data: any } | null> {
    const results = await Promise.allSettled(
        DOMESTIC_LEAGUES.map(l =>
            fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l}/teams/${id}`, { next: { revalidate: 300 } })
                .then(r => r.ok ? r.json() : Promise.reject())
                .then(d => d.team?.standingSummary ? { league: l, data: d } : Promise.reject())
        )
    ) 
    const found = results.find(r => r.status === 'fulfilled')
    return found?.status === 'fulfilled' ? found.value : null
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const league = new URL(request.url).searchParams.get('league') || 'eng.1'
    const isCompetition = COMPETITION_LEAGUES.includes(league)
    const base = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${id}`

    try {
        const [rosterRes, scheduleRes] = await Promise.all([
            fetch(`${base}/roster`, { next: { revalidate: 300 } }),
            fetch(`${base}/schedule`, { next: { revalidate: 300 } }),
        ])

        const [rosterData, scheduleData] = await Promise.all([
            rosterRes.json(),
            scheduleRes.json(),
        ])

        let teamData: any
        if (isCompetition) {
            // For national team competitions (World Cup), use the competition endpoint for team info
            // For club competitions (UCL/UEL), resolve to domestic league for correct standing
            const isNationalTeam = league === 'fifa.world'
            if (isNationalTeam) {
                teamData = await fetch(base, { next: { revalidate: 300 } }).then(r => r.json())
            } else {
                const resolved = await resolveDomesticLeague(id)
                teamData = resolved?.data ?? {}
            }
        } else {
            teamData = await fetch(base, { next: { revalidate: 300 } }).then(r => r.json())
        }

        const t = teamData.team ?? {}
        const record = t.record?.items?.[0]
        const getStat = (name: string) => record?.stats?.find((s: any) => s.name === name)?.value ?? 0

        // Squad grouped by position — handle both flat and grouped ESPN roster formats
        const rawAthletes = rosterData.athletes ?? []
        const flatAthletes = rawAthletes.length > 0 && rawAthletes[0]?.items
            ? rawAthletes.flatMap((group: any) => group.items ?? [])
            : rawAthletes

        const posOrder = ['G', 'D', 'M', 'F']
        const squad: Record<string, any[]> = { G: [], D: [], M: [], F: [] }
        for (const athlete of flatAthletes) {
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
