"use client"

import { useEffect, useState } from 'react'
import MatchCard from '../ui/MatchCard'

type Fixture = {
    fixture: {
        id: number
        date: string
        status: { long: string; short: string; elapsed: number | null }
        venue: { name: string; city: string }
    }
    league: {
        name: string
        country: string
        logo: string
        flag: string
        round: string
    }
    teams: {
        home: { id: number; name: string; logo: string; winner: boolean | null }
        away: { id: number; name: string; logo: string; winner: boolean | null }
    }
    goals: { home: number | null; away: number | null }
}

const TABS = ['All', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'Europa League', 'Conference League']

export default function FixturesSection() {
    const [fixtures, setFixtures] = useState<Fixture[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [activeTab, setActiveTab] = useState('All')

    useEffect(() => {
        fetch('/api/fixtures')
            .then(res => res.json())
            .then(data => {
                setFixtures(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => {
                setError(true)
                setLoading(false)
            })
    }, [])

    const filtered = activeTab === 'All'
        ? fixtures
        : fixtures.filter(f => f.league.name === activeTab)

    return (
        <section className='w-full py-16 px-4'>
            <div className='max-w-7xl mx-auto'>

                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <div>
                        <h2 className='text-2xl font-bold text-white'>Fixtures</h2>
                        <p className='text-sm text-[#9ca3af] mt-1'>Live & upcoming matches</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className='flex items-center gap-2 mb-8 overflow-x-auto pb-1'>
                    {TABS.map(tab => (
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

                {/* Grid */}
                {loading ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className='glass rounded-2xl p-4 h-48 animate-pulse' />
                        ))}
                    </div>
                ) : error ? (
                    <div className='text-center text-[#9ca3af] py-12'>Failed to load fixtures</div>
                ) : filtered.length === 0 ? (
                    <div className='text-center text-[#9ca3af] py-12'>No fixtures available</div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {filtered.map((f) => (
                            <MatchCard key={f.fixture.id} {...f} />
                        ))}
                    </div>
                )}

            </div>
        </section>
    )
}
