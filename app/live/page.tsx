"use client"

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LiveMatchCard from '../components/ui/LiveMatchCard'
import FootballLoader from '../components/ui/FootballLoader'

type Fixture = {
    fixture: {
        id: number
        date: string
        status: { long: string; short: string; elapsed: number | null }
        venue: { name: string; city: string }
    }
    league: { name: string; country: string; logo: string; round: string }
    teams: {
        home: { id: number; name: string; logo: string; winner: boolean | null }
        away: { id: number; name: string; logo: string; winner: boolean | null }
    }
    goals: { home: number | null; away: number | null }
}

const LIVE_STATUSES = ['1H', '2H', 'ET', 'P', 'HT']
const isLive = (s: string) => LIVE_STATUSES.includes(s)
const isToday = (date: string) => new Date().toDateString() === new Date(date).toDateString()
const isUpcoming = (date: string) => new Date(date) > new Date() && !isToday(date)

const LEAGUE_TABS = ['All', 'World Cup', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'Europa League', 'Conference League']

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
    return (
        <div className='flex items-center gap-3 mb-5'>
            <span className='text-xs font-bold uppercase tracking-widest text-[#9ca3af]'>{children}</span>
            {count !== undefined && (
                <span className='text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#9ca3af] font-medium'>{count}</span>
            )}
            <div className='flex-1 h-px bg-white/5' />
        </div>
    )
}

function RefreshBar({ lastUpdated, refreshing }: { lastUpdated: Date | null; refreshing: boolean }) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 10000)
        return () => clearInterval(id)
    }, [])

    const secs = lastUpdated ? Math.floor((now.getTime() - lastUpdated.getTime()) / 1000) : null

    return (
        <div className='flex items-center gap-2 text-xs text-[#6b7280]'>
            {refreshing ? (
                <span className='flex items-center gap-1.5'>
                    <svg className='w-3 h-3 animate-spin' viewBox='0 0 24 24' fill='none'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                    </svg>
                    Updating...
                </span>
            ) : secs !== null ? (
                <span>Updated {secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m`} ago</span>
            ) : null}
        </div>
    )
}

export default function LivePage() {
    const [fixtures, setFixtures] = useState<Fixture[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [activeTab, setActiveTab] = useState('All')

    const fetchFixtures = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        try {
            const res = await fetch('/api/fixtures', { cache: 'no-store' })
            const data = await res.json()
            setFixtures(Array.isArray(data) ? data : [])
            setLastUpdated(new Date())
        } catch {
            // keep existing data on refresh failure
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchFixtures()
    }, [fetchFixtures])

    // Adaptive polling — 15s when live matches, 60s otherwise
    useEffect(() => {
        const hasLiveNow = fixtures.some(f => isLive(f.fixture.status.short))
        const interval = hasLiveNow ? 15000 : 60000
        const id = setInterval(() => fetchFixtures(true), interval)
        return () => clearInterval(id)
    }, [fetchFixtures, fixtures])

    const filtered = activeTab === 'All'
        ? fixtures
        : fixtures.filter(f => f.league.name === activeTab)

    const liveMatches = filtered.filter(f => isLive(f.fixture.status.short))
    const todayMatches = filtered.filter(f => !isLive(f.fixture.status.short) && isToday(f.fixture.date))
    const upcomingMatches = filtered.filter(f => isUpcoming(f.fixture.date) && f.fixture.status.short === 'NS')

    const hasLive = liveMatches.length > 0

    return (
        <div className='min-h-screen w-full px-4 py-12'>
            <div className='max-w-7xl mx-auto'>

                {/* Header */}
                <div className='flex items-start justify-between mb-8'>
                    <div>
                        <div className='flex items-center gap-3 mb-1'>
                            <h1 className='text-3xl font-bold text-white'>Live</h1>
                            {hasLive && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className='flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF4747]/15 text-[#FF4747] text-xs font-bold'
                                >
                                    <span className='w-1.5 h-1.5 rounded-full bg-[#FF4747] animate-live' />
                                    {liveMatches.length} live
                                </motion.span>
                            )}
                        </div>
                        <p className='text-sm text-[#9ca3af]'>Auto-refreshes every {fixtures.some(f => isLive(f.fixture.status.short)) ? '15s' : '60s'}</p>
                    </div>
                    <div className='flex items-center gap-3 pt-1'>
                        <RefreshBar lastUpdated={lastUpdated} refreshing={refreshing} />
                        <button
                            onClick={() => fetchFixtures(true)}
                            disabled={refreshing}
                            className='text-xs px-3 py-1.5 rounded-lg border border-white/10 text-[#9ca3af] hover:text-white hover:border-white/20 transition-all duration-150 disabled:opacity-40'
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* League tabs */}
                <div className='flex items-center gap-2 mb-8 overflow-x-auto pb-1 no-scrollbar'>
                    {LEAGUE_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                activeTab === tab
                                    ? 'bg-[#00F5D4] text-black'
                                    : 'text-[#9ca3af] border border-white/10 hover:text-white hover:border-white/20'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <FootballLoader text='Fetching live scores...' />
                ) : (
                    <div className='space-y-10'>

                        {/* Live Now */}
                        <AnimatePresence>
                            {liveMatches.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <SectionLabel count={liveMatches.length}>
                                        <span className='w-2 h-2 rounded-full bg-[#FF4747] animate-live inline-block mr-1' />
                                        Live Now
                                    </SectionLabel>
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                        {liveMatches.map((f, i) => (
                                            <LiveMatchCard key={f.fixture.id} {...f} index={i} />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Today */}
                        {todayMatches.length > 0 && (
                            <div>
                                <SectionLabel count={todayMatches.length}>Today</SectionLabel>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {todayMatches.map((f, i) => (
                                        <LiveMatchCard key={f.fixture.id} {...f} index={liveMatches.length + i} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming */}
                        {upcomingMatches.length > 0 && (
                            <div>
                                <SectionLabel count={upcomingMatches.length}>Upcoming</SectionLabel>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {upcomingMatches.map((f, i) => (
                                        <LiveMatchCard key={f.fixture.id} {...f} index={liveMatches.length + todayMatches.length + i} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {liveMatches.length === 0 && todayMatches.length === 0 && upcomingMatches.length === 0 && (
                            <div className='glass rounded-2xl p-16 text-center'>
                                <p className='text-2xl mb-2'>⚽</p>
                                <p className='text-white font-semibold mb-1'>No matches found</p>
                                <p className='text-sm text-[#9ca3af]'>
                                    {activeTab === 'All' ? 'Check back later for upcoming fixtures' : `No ${activeTab} fixtures available`}
                                </p>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    )
}
