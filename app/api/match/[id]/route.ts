import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const league = new URL(request.url).searchParams.get('league') || 'eng.1'

    try {
        const res = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/summary?event=${id}`,
            { next: { revalidate: 60 } }
        )
        if (!res.ok) throw new Error('ESPN fetch failed')
        const data = await res.json()

        const competition = data.header?.competitions?.[0]
        const competitors = competition?.competitors ?? []
        const home = competitors.find((c: any) => c.homeAway === 'home')
        const away = competitors.find((c: any) => c.homeAway === 'away')
        const status = competition?.status

        const h2h: any[] = data.headToHeadGames ?? []
        const formData: any[] = data.boxscore?.form ?? []
        const teamsStats: any[] = data.boxscore?.teams ?? []

        return NextResponse.json({
            match: {
                id,
                date: competition?.date ?? '',
                status: {
                    name: status?.type?.name ?? '',
                    description: status?.type?.description ?? '',
                    clock: status?.displayClock ?? '',
                    period: status?.period ?? 0,
                },
                venue: {
                    name: data.gameInfo?.venue?.fullName ?? '',
                    city: data.gameInfo?.venue?.address?.city ?? '',
                },
                league: data.header?.league?.name ?? '',
                home: {
                    id: home?.team?.id ?? '',
                    name: home?.team?.displayName ?? '',
                    logo: home?.team?.logo ?? home?.team?.logos?.[0]?.href ?? '',
                    score: home?.score ?? null,
                    winner: home?.winner ?? null,
                    record: home?.record?.[0]?.displayValue ?? '',
                },
                away: {
                    id: away?.team?.id ?? '',
                    name: away?.team?.displayName ?? '',
                    logo: away?.team?.logo ?? away?.team?.logos?.[0]?.href ?? '',
                    score: away?.score ?? null,
                    winner: away?.winner ?? null,
                    record: away?.record?.[0]?.displayValue ?? '',
                },
            },
            h2h: h2h.map((g: any) => ({
                teamId: g.team?.id,
                events: (g.events ?? []).slice(0, 5).map((e: any) => ({
                    id: e.id,
                    date: e.gameDate,
                    homeTeamId: e.homeTeamId,
                    awayTeamId: e.awayTeamId,
                    homeScore: e.homeTeamScore,
                    awayScore: e.awayTeamScore,
                    result: e.gameResult,
                    competition: (e.competitionName ?? '').replace(/^\d{4}-\d{2}\s/, ''),
                })),
            })),
            form: formData.map((f: any) => ({
                team: {
                    id: f.team?.id,
                    name: f.team?.displayName,
                    logo: f.team?.logo ?? f.team?.logos?.[0]?.href ?? '',
                },
                events: (f.events ?? []).slice(0, 5).map((e: any) => ({
                    date: e.gameDate,
                    score: e.score,
                    result: e.gameResult,
                    opponent: e.opponent?.displayName ?? '',
                    opponentLogo: e.opponentLogo ?? '',
                    atVs: e.atVs,
                })),
            })),
            stats: teamsStats.map((t: any) => ({
                team: { id: t.team?.id, name: t.team?.displayName, homeAway: t.homeAway },
                statistics: t.statistics ?? [],
            })),
        })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 })
    }
}
