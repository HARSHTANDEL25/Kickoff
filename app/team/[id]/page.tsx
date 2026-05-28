'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import FootballLoader from '@/app/components/ui/FootballLoader'

type Player = {
    id: string; name: string; shortName: string; jersey: string
    age: string | number; position: string; posAbbr: string
    nationality: string; flag: string; height: string; status: string
}

type MatchEntry = {
    id: string; date: string; opponent: string; opponentLogo: string
    isHome: boolean; teamScore: string; opponentScore: string
    winner: boolean | null; competition: string
}

type TeamData = {
    team: {
        id: string; name: string; shortName: string; abbreviation: string
        logo: string; color: string; altColor: string; standing: string
        record: { summary: string; wins: number; draws: number; losses: number; points: number; goalsFor: number; goalsAgainst: number; rank: number }
    }
    squad: Record<string, Player[]>
    results: MatchEntry[]
    upcoming: MatchEntry[]
}

const POS_FILTERS = [
    { key: 'All', label: 'All' },
    { key: 'G',   label: 'GK' },
    { key: 'D',   label: 'DEF' },
    { key: 'M',   label: 'MID' },
    { key: 'F',   label: 'FWD' },
]

const resultLabel = (winner: boolean | null) => {
    if (winner === true)  return { label: 'W', cls: 'bg-[#00F5D4] text-black' }
    if (winner === false) return { label: 'L', cls: 'bg-[#FF4747] text-white' }
    return { label: 'D', cls: 'bg-[#6b7280] text-white' }
}

function JerseyBlock({ jersey, accentColor }: { jersey: string; accentColor: string }) {
    return (
        <div
            className='w-full h-20 rounded-lg flex items-center justify-center relative overflow-hidden'
            style={{ background: `${accentColor}12` }}
        >
            {/* Large faint number behind */}
            <span className='absolute text-7xl font-black opacity-10 select-none leading-none'
                style={{ color: accentColor }}>
                {jersey || '0'}
            </span>
            {/* Prominent jersey number */}
            <span className='relative text-3xl font-black' style={{ color: accentColor }}>
                {jersey ? `#${jersey}` : '—'}
            </span>
        </div>
    )
}

function OpponentLogo({ logo, name }: { logo: string; name: string }) {
    if (logo) return (
        <div className='relative w-8 h-8 shrink-0'>
            <Image src={logo} alt={name} fill sizes='32px' className='object-contain' />
        </div>
    )
    return (
        <div className='w-8 h-8 shrink-0 rounded-full bg-white/8 flex items-center justify-center text-xs font-bold text-[#9ca3af]'>
            {name.charAt(0)}
        </div>
    )
}

function TeamContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params.id as string
    const league = searchParams.get('league') || 'eng.1'

    const [data, setData] = useState<TeamData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [activeTab, setActiveTab] = useState<'squad' | 'results' | 'fixtures'>('squad')
    const [posFilter, setPosFilter] = useState('All')

    useEffect(() => {
        fetch(`/api/team/${id}?league=${league}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(() => { setError(true); setLoading(false) })
    }, [id, league])

    if (loading) return (
        <div className='min-h-screen flex items-center justify-center'>
            <FootballLoader />
        </div>
    )
    if (error || !data?.team) return (
        <div className='min-h-screen flex items-center justify-center text-[#9ca3af]'>
            Failed to load team
        </div>
    )

    const { team, squad, results, upcoming } = data
    const accentColor = `#${team.color === '000000' || team.color === 'ffffff' ? '00F5D4' : team.color}`

    const allPlayers: Player[] = [
        ...(squad['G'] ?? []),
        ...(squad['D'] ?? []),
        ...(squad['M'] ?? []),
        ...(squad['F'] ?? []),
    ]
    const filteredPlayers = posFilter === 'All'
        ? allPlayers
        : allPlayers.filter(p => p.posAbbr?.startsWith(posFilter))

    return (
        <main className='min-h-screen pt-20 pb-16 px-4'>
            <div className='max-w-2xl mx-auto'>

                {/* Back */}
                <Link href='/live' className='inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-white mb-6 transition-colors'>
                    <ArrowLeft size={15} />
                    Back
                </Link>

                {/* Team Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='glass rounded-2xl p-6 mb-4 relative overflow-hidden'
                >
                    <div className='absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-[80px] opacity-10 pointer-events-none'
                        style={{ background: accentColor }} />

                    <div className='relative flex items-center gap-5'>
                        <div className='relative w-20 h-20 shrink-0'>
                            <Image src={team.logo} alt={team.name} fill sizes='80px' className='object-contain' />
                        </div>
                        <div className='flex-1 min-w-0'>
                            <h1 className='text-2xl font-black text-white leading-tight'>{team.name}</h1>
                            <p className='text-sm text-[#9ca3af] mt-0.5'>{team.standing}</p>
                            <div className='flex items-center gap-4 mt-3 flex-wrap'>
                                {[
                                    { label: 'W',   value: team.record.wins,         color: '#00F5D4' },
                                    { label: 'D',   value: team.record.draws,        color: '#9ca3af' },
                                    { label: 'L',   value: team.record.losses,       color: '#FF4747' },
                                    { label: 'Pts', value: team.record.points,       color: 'white'   },
                                    { label: 'GF',  value: team.record.goalsFor,     color: '#9ca3af' },
                                    { label: 'GA',  value: team.record.goalsAgainst, color: '#9ca3af' },
                                ].map(s => (
                                    <div key={s.label} className='text-center'>
                                        <div className='text-lg font-black' style={{ color: s.color }}>{s.value}</div>
                                        <div className='text-[10px] text-[#6b7280] uppercase tracking-wider'>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main tabs */}
                <div className='flex items-center gap-2 mb-4'>
                    {(['squad', 'results', 'fixtures'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                                activeTab === tab
                                    ? 'bg-[#00F5D4] text-black'
                                    : 'text-[#9ca3af] border border-white/10 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Squad ── */}
                {activeTab === 'squad' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                        {/* Position filter */}
                        <div className='flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar'>
                            {POS_FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setPosFilter(f.key)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                                        posFilter === f.key
                                            ? 'text-black'
                                            : 'text-[#9ca3af] border border-white/10 hover:text-white'
                                    }`}
                                    style={posFilter === f.key ? { background: accentColor } : undefined}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Player grid */}
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={posFilter}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className='grid grid-cols-2 sm:grid-cols-3 gap-3'
                            >
                                {filteredPlayers.map((p, i) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className='glass rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden'
                                    >
                                        {/* Jersey block */}
                                        <JerseyBlock jersey={p.jersey} accentColor={accentColor} />

                                        {/* Jersey + position badge */}
                                        <div className='flex items-center justify-between'>
                                            <span className='text-lg font-black' style={{ color: accentColor }}>
                                                #{p.jersey || '—'}
                                            </span>
                                            <span className='text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white/10 text-[#9ca3af]'>
                                                {p.posAbbr}
                                            </span>
                                        </div>

                                        {/* Name */}
                                        <div>
                                            <p className='text-sm font-bold text-white leading-tight truncate'>{p.name}</p>
                                            <p className='text-[11px] text-[#6b7280] mt-0.5'>{p.nationality}</p>
                                        </div>

                                        {/* Age + injury */}
                                        <div className='flex items-center justify-between mt-auto pt-1'>
                                            {p.age ? (
                                                <span className='text-xs text-[#6b7280]'>{p.age}y</span>
                                            ) : <span />}
                                            {p.status && (
                                                <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF4747]/15 text-[#FF4747] font-medium'>
                                                    {p.status}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ── Results ── */}
                {activeTab === 'results' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='glass rounded-2xl overflow-hidden'>
                        {results.length === 0 ? (
                            <div className='p-8 text-center text-[#6b7280] text-sm'>No results available</div>
                        ) : (
                            <div className='divide-y divide-white/5'>
                                {results.map(r => {
                                    const { label, cls } = resultLabel(r.winner)
                                    return (
                                        <Link key={r.id} href={`/match/${r.id}?league=${league}`}
                                            className='flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors'>
                                            <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                                                {label}
                                            </span>
                                            <OpponentLogo logo={r.opponentLogo} name={r.opponent} />
                                            <div className='flex-1 min-w-0'>
                                                <span className='text-sm text-white font-medium truncate block'>
                                                    {r.isHome ? 'vs' : '@'} {r.opponent}
                                                </span>
                                                <span className='text-[11px] text-[#6b7280]'>
                                                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {r.competition}
                                                </span>
                                            </div>
                                            <span className='text-sm font-bold text-white tabular-nums shrink-0'>
                                                {r.teamScore} – {r.opponentScore}
                                            </span>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── Fixtures ── */}
                {activeTab === 'fixtures' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='glass rounded-2xl overflow-hidden'>
                        {upcoming.length === 0 ? (
                            <div className='p-8 text-center text-[#6b7280] text-sm'>No upcoming fixtures</div>
                        ) : (
                            <div className='divide-y divide-white/5'>
                                {upcoming.map(f => (
                                    <Link key={f.id} href={`/match/${f.id}?league=${league}`}
                                        className='flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors'>
                                        <OpponentLogo logo={f.opponentLogo} name={f.opponent} />
                                        <div className='flex-1 min-w-0'>
                                            <span className='text-sm text-white font-medium truncate block'>
                                                {f.isHome ? 'vs' : '@'} {f.opponent}
                                            </span>
                                            <span className='text-[11px] text-[#6b7280]'>{f.competition}</span>
                                        </div>
                                        <div className='text-right shrink-0'>
                                            <p className='text-xs text-[#9ca3af]'>
                                                {new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className='text-xs text-[#6b7280]'>
                                                {new Date(f.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

            </div>
        </main>
    )
}

export default function TeamPage() {
    return (
        <Suspense fallback={
            <div className='min-h-screen flex items-center justify-center'>
                <FootballLoader />
            </div>
        }>
            <TeamContent />
        </Suspense>
    )
}
