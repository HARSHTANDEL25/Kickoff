"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StandingsTable from '../components/ui/StandingsTable'
import KnockoutBracket from '../components/ui/KnockoutBracket'

const LEAGUES = [
    { key: 'pl', slug: 'eng.1', name: 'Premier League', country: 'England', flag: '🏴', european: false, color: '#3d195b', accent: '#e90052' },
    { key: 'laliga', slug: 'esp.1', name: 'La Liga', country: 'Spain', flag: '🇪🇸', european: false, color: '#ff4b44', accent: '#ff4b44' },
    { key: 'seriea', slug: 'ita.1', name: 'Serie A', country: 'Italy', flag: '🇮🇹', european: false, color: '#024494', accent: '#024494' },
    { key: 'bundesliga', slug: 'ger.1', name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', european: false, color: '#d3010c', accent: '#d3010c' },
    { key: 'ligue1', slug: 'fra.1', name: 'Ligue 1', country: 'France', flag: '🇫🇷', european: false, color: '#091c3e', accent: '#1d9bf0' },
    { key: 'ucl', slug: 'uefa.champions', name: 'Champions League', country: 'Europe', flag: '⭐', european: true, color: '#001d3d', accent: '#00f5d4' },
    { key: 'uel', slug: 'uefa.europa', name: 'Europa League', country: 'Europe', flag: '🟠', european: true, color: '#7c2d12', accent: '#f97316' },
    { key: 'uecl', slug: 'uefa.europa.conf', name: 'Conference League', country: 'Europe', flag: '🔵', european: true, color: '#1e3a5f', accent: '#60a5fa' },
]

function LeagueCard({ l, i, activeLeague, onClick }: { l: typeof LEAGUES[0]; i: number; activeLeague: string; onClick: () => void }) {
    const isActive = activeLeague === l.key
    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className='relative flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border shrink-0 overflow-hidden transition-colors duration-300'
            style={{
                borderColor: isActive ? l.accent : 'rgba(255,255,255,0.08)',
                background: isActive ? `linear-gradient(135deg, ${l.color}cc, ${l.color}66)` : 'rgba(8,11,16,0.75)',
                backdropFilter: 'blur(16px)',
                minWidth: '140px',
            }}
        >
            {isActive && (
                <motion.div layoutId={`glow-${l.european ? 'eu' : 'dom'}`} className='absolute inset-0 opacity-20 blur-xl' style={{ background: l.accent }} />
            )}
            <span className='text-3xl relative z-10'>{l.flag}</span>
            <span className='text-sm font-bold whitespace-nowrap relative z-10' style={{ color: isActive ? '#fff' : '#9ca3af' }}>{l.name}</span>
            <span className='text-xs relative z-10' style={{ color: isActive ? l.accent : '#6b7280' }}>{l.country}</span>
            {isActive && (
                <motion.div layoutId={`underline-${l.european ? 'eu' : 'dom'}`} className='absolute bottom-0 left-4 right-4 h-0.5 rounded-full' style={{ background: l.accent }} />
            )}
        </motion.button>
    )
}

export default function LeaguesPage() {
    const [activeLeague, setActiveLeague] = useState('pl')
    const [standings, setStandings] = useState<any[]>([])
    const [bracket, setBracket] = useState<any[]>([])
    const [loadingStandings, setLoadingStandings] = useState(true)
    const [loadingBracket, setLoadingBracket] = useState(false)
    const [standingsCache, setStandingsCache] = useState<Record<string, any[]>>({})
    const [bracketCache, setBracketCache] = useState<Record<string, any[]>>({})

    const league = LEAGUES.find(l => l.key === activeLeague)!

    useEffect(() => {
        if (league.european) {
            if (bracketCache[activeLeague]) {
                setBracket(bracketCache[activeLeague])
            } else {
                setLoadingBracket(true)
                fetch(`/api/bracket?comp=${activeLeague}`)
                    .then(r => r.json())
                    .then(data => {
                        const rows = Array.isArray(data) ? data : []
                        setBracket(rows)
                        setBracketCache(prev => ({ ...prev, [activeLeague]: rows }))
                        setLoadingBracket(false)
                    })
                    .catch(() => setLoadingBracket(false))
            }
        } else {
            if (standingsCache[activeLeague]) {
                setStandings(standingsCache[activeLeague])
            } else {
                setLoadingStandings(true)
                fetch(`/api/standings?league=${activeLeague}`)
                    .then(r => r.json())
                    .then(data => {
                        const rows = Array.isArray(data) ? data : []
                        setStandings(rows)
                        setStandingsCache(prev => ({ ...prev, [activeLeague]: rows }))
                        setLoadingStandings(false)
                    })
                    .catch(() => setLoadingStandings(false))
            }
        }
    }, [activeLeague])

    return (
        <div className='min-h-screen w-full px-4 py-12'>
            <div className='max-w-7xl mx-auto'>

                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-white'>Leagues</h1>
                    <p className='text-sm text-[#9ca3af] mt-1'>Standings & knockout brackets</p>
                </div>

                {/* Domestic leagues */}
                <div className='mb-4'>
                    <p className='text-xs text-[#9ca3af] uppercase tracking-widest mb-3 font-medium'>Domestic</p>
                    <div className='flex gap-4 overflow-x-auto pb-2'>
                        {LEAGUES.filter(l => !l.european).map((l, i) => (
                            <LeagueCard key={l.key} l={l} i={i} activeLeague={activeLeague} onClick={() => setActiveLeague(l.key)} />
                        ))}
                    </div>
                </div>

                {/* European competitions */}
                <div className='mb-10'>
                    <p className='text-xs text-[#9ca3af] uppercase tracking-widest mb-3 font-medium'>European</p>
                    <div className='flex gap-4 pb-2'>
                        {LEAGUES.filter(l => l.european).map((l, i) => (
                            <LeagueCard key={l.key} l={l} i={i + 5} activeLeague={activeLeague} onClick={() => setActiveLeague(l.key)} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                {league.european ? (
                    <div>
                        <h2 className='text-lg font-bold text-white mb-4'>Knockout Bracket</h2>
                        <div className='glass rounded-2xl p-4'>
                            {loadingBracket ? (
                                <div className='flex gap-6 overflow-x-auto pb-2'>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className='space-y-3'>
                                            {Array.from({ length: Math.max(1, 8 / Math.pow(2, i)) }).map((_, j) => (
                                                <div key={j} className='w-72 h-20 rounded-xl bg-white/5 animate-pulse' />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <KnockoutBracket rounds={bracket} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className='text-lg font-bold text-white mb-4'>{league.name} Table</h2>
                        <div className='glass rounded-2xl overflow-hidden'>
                            {loadingStandings ? (
                                <div className='space-y-px p-2'>
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className='h-10 rounded-lg bg-white/5 animate-pulse' />
                                    ))}
                                </div>
                            ) : (
                                <StandingsTable standings={standings} leagueSlug={league.slug} />
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
