'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import FootballLoader from '@/app/components/ui/FootballLoader'

type Team = {
    id: string
    name: string
    shortName: string
    logo: string
    color: string
    slug: string
}

type LeagueGroup = {
    league: string
    slug: string
    teams: Team[]
}

export default function TeamsPage() {
    const [leagues, setLeagues] = useState<LeagueGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [active, setActive] = useState(0)

    useEffect(() => {
        fetch('/api/teams')
            .then(r => r.json())
            .then(d => { setLeagues(Array.isArray(d) ? d : []); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className='min-h-screen flex items-center justify-center'>
            <FootballLoader />
        </div>
    )

    const current = leagues[active]

    return (
        <main className='min-h-screen pt-24 pb-16 px-4'>
            <div className='max-w-4xl mx-auto'>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mb-8'
                >
                    <h1 className='text-3xl font-black text-white'>Teams</h1>
                    <p className='text-sm text-[#9ca3af] mt-1'>Browse squads, results and fixtures</p>
                </motion.div>

                {/* League tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className='flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-1'
                >
                    {leagues.map((lg, i) => (
                        <button
                            key={lg.slug}
                            onClick={() => setActive(i)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                active === i
                                    ? 'bg-[#00F5D4] text-black'
                                    : 'text-[#9ca3af] border border-white/10 hover:text-white hover:border-white/20'
                            }`}
                        >
                            {lg.league}
                        </button>
                    ))}
                </motion.div>

                {/* Team grid */}
                <AnimatePresence mode='wait'>
                    {current && (
                        <motion.div
                            key={current.slug}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3'
                        >
                            {current.teams.map((team, i) => (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.025 }}
                                >
                                    <Link
                                        href={`/team/${team.id}?league=${team.slug}`}
                                        className='glass rounded-xl p-4 flex flex-col items-center gap-3 hover:bg-white/8 transition-all duration-200 group cursor-pointer'
                                    >
                                        {team.logo ? (
                                            <div className='relative w-12 h-12 shrink-0 transition-transform duration-200 group-hover:scale-110'>
                                                <Image src={team.logo} alt={team.name} fill sizes='48px' className='object-contain' />
                                            </div>
                                        ) : (
                                            <div className='w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-base font-black text-[#9ca3af]'>
                                                {team.shortName?.charAt(0)}
                                            </div>
                                        )}
                                        <span className='text-[11px] font-medium text-[#9ca3af] group-hover:text-white text-center leading-tight transition-colors line-clamp-2 w-full'>
                                            {team.shortName || team.name}
                                        </span>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </main>
    )
}
