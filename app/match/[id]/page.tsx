'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar } from 'lucide-react'
import FootballLoader from '@/app/components/ui/FootballLoader'

type MatchData = {
    match: {
        id: string
        date: string
        status: { name: string; description: string; clock: string; period: number }
        venue: { name: string; city: string }
        league: string
        home: { id: string; name: string; logo: string; score: string | null; winner: boolean | null; record: string }
        away: { id: string; name: string; logo: string; score: string | null; winner: boolean | null; record: string }
    }
    h2h: Array<{
        teamId: string
        events: Array<{
            id: string; date: string; homeTeamId: string; awayTeamId: string
            homeScore: string; awayScore: string; result: string; competition: string
        }>
    }>
    form: Array<{
        team: { id: string; name: string; logo: string }
        events: Array<{ date: string; score: string; result: string; opponent: string; opponentLogo: string; atVs: string }>
    }>
    stats: Array<{
        team: { id: string; name: string; homeAway: string }
        statistics: Array<{ name: string; displayValue: string; label: string }>
    }>
}

const resultStyle = (r: string) =>
    r === 'W' ? 'bg-[#00F5D4] text-black' : r === 'D' ? 'bg-[#6b7280] text-white' : 'bg-[#FF4747] text-white'

const STAT_KEYS = ['totalGoals', 'goalAssists', 'goalsConceded']

function MatchContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params.id as string
    const league = searchParams.get('league') || 'eng.1'

    const [data, setData] = useState<MatchData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        fetch(`/api/match/${id}?league=${league}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(() => { setError(true); setLoading(false) })
    }, [id, league])

    if (loading) return (
        <div className='min-h-screen flex items-center justify-center'>
            <FootballLoader />
        </div>
    )

    if (error || !data?.match) return (
        <div className='min-h-screen flex items-center justify-center text-[#9ca3af]'>
            Failed to load match
        </div>
    )

    const { match, h2h, form, stats } = data
    const statusName = match.status.name
    const isLive = ['STATUS_IN_PROGRESS', 'STATUS_HALFTIME'].includes(statusName)
    const isFinished = statusName === 'STATUS_FINAL'
    const hasScore = isLive || isFinished

    const matchDate = new Date(match.date)
    const dateStr = matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const timeStr = matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    // H2H — prefer home team's perspective
    const homeH2H = h2h.find(g => g.teamId === match.home.id) ?? h2h[0]
    const h2hEvents = homeH2H?.events ?? []

    // Form
    const homeForm = form.find(f => f.team.id === match.home.id)?.events ?? []
    const awayForm = form.find(f => f.team.id === match.away.id)?.events ?? []

    // Stats
    const homeStats = stats.find(s => s.team.homeAway === 'home')?.statistics ?? []
    const awayStats = stats.find(s => s.team.homeAway === 'away')?.statistics ?? []

    const getStat = (arr: typeof homeStats, name: string) =>
        arr.find(s => s.name === name)

    return (
        <main className='min-h-screen pt-20 pb-16 px-4'>
            <div className='max-w-2xl mx-auto'>

                {/* Back */}
                <Link href='/live' className='inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-white mb-6 transition-colors'>
                    <ArrowLeft size={15} />
                    Back to Live
                </Link>

                {/* Match Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='glass rounded-2xl p-6 mb-4'
                >
                    {match.league && (
                        <p className='text-xs text-[#6b7280] text-center mb-4 uppercase tracking-widest'>{match.league}</p>
                    )}

                    <div className='flex items-center justify-between gap-4 mb-5'>
                        {/* Home */}
                        <Link href={`/team/${match.home.id}?league=${league}`} className='flex flex-col items-center gap-2 flex-1 group'>
                            <div className='relative w-16 h-16 transition-transform group-hover:scale-105'>
                                <Image src={match.home.logo} alt={match.home.name} fill sizes='64px' className='object-contain' />
                            </div>
                            <span className='text-sm font-bold text-white text-center leading-tight group-hover:text-[#00F5D4] transition-colors'>{match.home.name}</span>
                            {match.home.record && (
                                <span className='text-[11px] text-[#6b7280]'>{match.home.record}</span>
                            )}
                        </Link>

                        {/* Score / VS */}
                        <div className='flex flex-col items-center gap-1.5 shrink-0'>
                            {hasScore ? (
                                <div className='flex items-center gap-3'>
                                    <span className={`text-4xl font-black tabular-nums ${match.home.winner ? 'text-white' : isFinished ? 'text-[#9ca3af]' : 'text-white'}`}>
                                        {match.home.score ?? 0}
                                    </span>
                                    <span className='text-2xl text-[#374151] font-bold'>-</span>
                                    <span className={`text-4xl font-black tabular-nums ${match.away.winner ? 'text-white' : isFinished ? 'text-[#9ca3af]' : 'text-white'}`}>
                                        {match.away.score ?? 0}
                                    </span>
                                </div>
                            ) : (
                                <span className='text-2xl font-bold text-[#9ca3af]'>vs</span>
                            )}
                            {isLive && (
                                <span className='flex items-center gap-1.5 text-xs text-[#FF4747] font-semibold'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-[#FF4747] animate-live' />
                                    {statusName === 'STATUS_HALFTIME' ? 'Half Time' : `${match.status.clock}'`}
                                </span>
                            )}
                            {isFinished && <span className='text-xs text-[#6b7280]'>Full Time</span>}
                            {!hasScore && <span className='text-xs text-[#9ca3af] font-medium'>{timeStr}</span>}
                        </div>

                        {/* Away */}
                        <Link href={`/team/${match.away.id}?league=${league}`} className='flex flex-col items-center gap-2 flex-1 group'>
                            <div className='relative w-16 h-16 transition-transform group-hover:scale-105'>
                                <Image src={match.away.logo} alt={match.away.name} fill sizes='64px' className='object-contain' />
                            </div>
                            <span className='text-sm font-bold text-white text-center leading-tight group-hover:text-[#00F5D4] transition-colors'>{match.away.name}</span>
                            {match.away.record && (
                                <span className='text-[11px] text-[#6b7280]'>{match.away.record}</span>
                            )}
                        </Link>
                    </div>

                    {/* Meta */}
                    <div className='flex items-center justify-center flex-wrap gap-x-4 gap-y-1 pt-4 border-t border-white/5 text-xs text-[#6b7280]'>
                        <span className='flex items-center gap-1.5'>
                            <Calendar size={11} />
                            {dateStr} · {timeStr}
                        </span>
                        {match.venue.name && (
                            <span className='flex items-center gap-1.5'>
                                <MapPin size={11} />
                                {match.venue.name}{match.venue.city ? `, ${match.venue.city}` : ''}
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* H2H */}
                {h2hEvents.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className='glass rounded-2xl p-5 mb-4'
                    >
                        <h3 className='text-sm font-bold text-white mb-4'>Head to Head</h3>
                        <div className='space-y-0'>
                            {h2hEvents.map((e, i) => (
                                <div key={e.id} className={`flex items-center justify-between py-2.5 ${i < h2hEvents.length - 1 ? 'border-b border-white/5' : ''}`}>
                                    <div className='flex flex-col gap-0.5'>
                                        <span className='text-xs text-[#9ca3af]'>
                                            {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                        </span>
                                        <span className='text-[10px] text-[#6b7280] max-w-[160px] truncate'>{e.competition}</span>
                                    </div>
                                    <div className='flex items-center gap-2.5'>
                                        <span className='text-sm font-bold text-white tabular-nums'>
                                            {e.homeScore} – {e.awayScore}
                                        </span>
                                        <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${resultStyle(e.result)}`}>
                                            {e.result}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Form Guide */}
                {(homeForm.length > 0 || awayForm.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.14 }}
                        className='glass rounded-2xl p-5 mb-4'
                    >
                        <h3 className='text-sm font-bold text-white mb-4'>Recent Form</h3>
                        <div className='grid grid-cols-2 gap-6'>
                            {[
                                { team: match.home, events: homeForm },
                                { team: match.away, events: awayForm },
                            ].map(({ team, events }) => (
                                <div key={team.id}>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='relative w-4 h-4 shrink-0'>
                                            <Image src={team.logo} alt={team.name} fill sizes='16px' className='object-contain' />
                                        </div>
                                        <span className='text-xs text-[#9ca3af] font-medium truncate'>{team.name}</span>
                                    </div>

                                    {/* Result circles */}
                                    <div className='flex items-center gap-1.5 mb-3'>
                                        {events.slice(0, 5).map((e, i) => (
                                            <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${resultStyle(e.result)}`}>
                                                {e.result}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mini results */}
                                    <div className='space-y-1.5'>
                                        {events.slice(0, 4).map((e, i) => (
                                            <div key={i} className='flex items-center justify-between gap-2'>
                                                <span className='text-[10px] text-[#6b7280] truncate flex-1'>
                                                    {e.atVs} {e.opponent}
                                                </span>
                                                <span className='text-[10px] text-[#9ca3af] font-medium shrink-0'>{e.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Season Stats */}
                {homeStats.length > 0 && awayStats.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className='glass rounded-2xl p-5'
                    >
                        <h3 className='text-sm font-bold text-white mb-5'>Season Stats</h3>
                        <div className='space-y-5'>
                            {STAT_KEYS.map(key => {
                                const hStat = getStat(homeStats, key)
                                const aStat = getStat(awayStats, key)
                                if (!hStat || !aStat) return null
                                const hVal = parseFloat(hStat.displayValue) || 0
                                const aVal = parseFloat(aStat.displayValue) || 0
                                const total = hVal + aVal || 1
                                const hPct = (hVal / total) * 100
                                const aPct = (aVal / total) * 100
                                return (
                                    <div key={key}>
                                        <div className='flex items-center justify-between mb-2'>
                                            <span className='text-sm font-bold text-white'>{hVal}</span>
                                            <span className='text-[11px] text-[#6b7280] uppercase tracking-wider'>{hStat.label}</span>
                                            <span className='text-sm font-bold text-white'>{aVal}</span>
                                        </div>
                                        <div className='flex items-center gap-0.5 h-1.5 rounded-full overflow-hidden'>
                                            <div
                                                className='h-full bg-[#00F5D4] rounded-l-full transition-all duration-700'
                                                style={{ width: `${hPct}%` }}
                                            />
                                            <div
                                                className='h-full bg-[#6b7280] rounded-r-full transition-all duration-700'
                                                style={{ width: `${aPct}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Team legend */}
                        <div className='flex items-center justify-between mt-5 pt-4 border-t border-white/5'>
                            <div className='flex items-center gap-1.5'>
                                <span className='w-2.5 h-2.5 rounded-full bg-[#00F5D4]' />
                                <span className='text-xs text-[#9ca3af]'>{match.home.name}</span>
                            </div>
                            <div className='flex items-center gap-1.5'>
                                <span className='text-xs text-[#9ca3af]'>{match.away.name}</span>
                                <span className='w-2.5 h-2.5 rounded-full bg-[#6b7280]' />
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>
        </main>
    )
}

export default function MatchPage() {
    return (
        <Suspense fallback={
            <div className='min-h-screen flex items-center justify-center'>
                <FootballLoader />
            </div>
        }>
            <MatchContent />
        </Suspense>
    )
}
