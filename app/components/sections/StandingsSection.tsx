"use client"

import { useEffect, useState } from 'react'
import StandingsTable from '../ui/StandingsTable'

const LEAGUES = [
    { label: 'Premier League', key: 'pl' },
    { label: 'La Liga', key: 'laliga' },
    { label: 'Serie A', key: 'seriea' },
    { label: 'Bundesliga', key: 'bundesliga' },
    { label: 'Ligue 1', key: 'ligue1' },
]

export default function StandingsSection() {
    const [activeLeague, setActiveLeague] = useState('pl')
    const [standings, setStandings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [cache, setCache] = useState<Record<string, any[]>>({})

    useEffect(() => {
        if (cache[activeLeague]) {
            setStandings(cache[activeLeague])
            return
        }
        setLoading(true)
        setError(false)
        fetch(`/api/standings?league=${activeLeague}`)
            .then(res => res.json())
            .then(data => {
                const rows = Array.isArray(data) ? data : []
                setStandings(rows)
                setCache(prev => ({ ...prev, [activeLeague]: rows }))
                setLoading(false)
            })
            .catch(() => {
                setError(true)
                setLoading(false)
            })
    }, [activeLeague])

    return (
        <section className='w-full py-16 px-4'>
            <div className='max-w-7xl mx-auto'>

                {/* Header */}
                <div className='mb-6'>
                    <h2 className='text-2xl font-bold text-white'>Standings</h2>
                    <p className='text-sm text-[#9ca3af] mt-1'>2025/26 Season</p>
                </div>

                {/* League Tabs */}
                <div className='flex items-center gap-2 mb-6 overflow-x-auto pb-1'>
                    {LEAGUES.map(({ label, key }) => (
                        <button
                            key={key}
                            onClick={() => setActiveLeague(key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                activeLeague === key
                                    ? 'bg-[#00F5D4] text-black'
                                    : 'text-[#9ca3af] border border-white/10 hover:text-white hover:border-white/20'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className='glass rounded-2xl overflow-hidden'>
                    {loading ? (
                        <div className='space-y-px p-2'>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className='h-10 rounded-lg bg-white/5 animate-pulse' />
                            ))}
                        </div>
                    ) : error ? (
                        <div className='text-center text-[#9ca3af] py-12'>Failed to load standings</div>
                    ) : (
                        <StandingsTable standings={standings} />
                    )}
                </div>

            </div>
        </section>
    )
}
