"use client"

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getLeagueSlug } from '@/app/lib/leagueSlug'

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

const isLive = (s: string) => ['1H', '2H', 'ET', 'P', 'HT'].includes(s)

const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + formatTime(date)
}

export default function LiveMatchCard({ fixture, league, teams, goals, index = 0 }: Fixture & { index?: number }) {
    const live = isLive(fixture.status.short)
    const finished = fixture.status.short === 'FT'
    const slug = getLeagueSlug(league.name)

    return (
        <Link href={`/match/${fixture.id}?league=${slug}`} className='block'>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
                className='relative glass rounded-2xl overflow-hidden cursor-pointer'
                style={live ? { borderColor: 'rgba(255,71,71,0.3)' } : undefined}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
                {live && (
                    <div className='absolute inset-0 pointer-events-none rounded-2xl'
                        style={{ boxShadow: '0 0 24px rgba(255,71,71,0.12) inset' }} />
                )}

                {/* Top bar */}
                <div className='flex items-center justify-between px-5 py-3 border-b border-white/5'>
                    <span className='text-xs text-[#9ca3af]'>{league.name}</span>
                    {live ? (
                        <span className='flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#FF4747]/15 text-[#FF4747] font-semibold'>
                            <span className='w-1.5 h-1.5 rounded-full bg-[#FF4747] animate-live' />
                            {fixture.status.elapsed ? `${fixture.status.elapsed}'` : fixture.status.short}
                        </span>
                    ) : finished ? (
                        <span className='text-xs text-[#9ca3af] font-medium'>Full Time</span>
                    ) : (
                        <span className='text-xs text-[#9ca3af]'>
                            {new Date().toDateString() === new Date(fixture.date).toDateString()
                                ? formatTime(fixture.date)
                                : formatDate(fixture.date)}
                        </span>
                    )}
                </div>

                {/* Match content */}
                <div className='px-5 py-5 flex items-center gap-4'>
                    {/* Home */}
                    <div className='flex-1 flex flex-col items-center gap-2.5 min-w-0'>
                        <div className='relative w-12 h-12 shrink-0'>
                            <Image src={teams.home.logo} alt={teams.home.name} fill sizes='48px' className='object-contain' />
                        </div>
                        <span className='text-sm font-semibold text-white text-center leading-tight px-1 truncate max-w-full'>
                            {teams.home.name}
                        </span>
                    </div>

                    {/* Score / VS */}
                    <div className='flex flex-col items-center shrink-0'>
                        {live || finished ? (
                            <>
                                <div className='flex items-center gap-3'>
                                    <span className={`text-3xl font-black tabular-nums ${teams.home.winner ? 'text-white' : finished ? 'text-[#9ca3af]' : 'text-white'}`}>
                                        {goals.home ?? 0}
                                    </span>
                                    <span className='text-lg text-[#4b5563] font-bold'>-</span>
                                    <span className={`text-3xl font-black tabular-nums ${teams.away.winner ? 'text-white' : finished ? 'text-[#9ca3af]' : 'text-white'}`}>
                                        {goals.away ?? 0}
                                    </span>
                                </div>
                                {live && (
                                    <span className='text-xs text-[#FF4747] font-medium mt-1 uppercase tracking-wide'>
                                        {fixture.status.short === 'HT' ? 'Half Time' : 'Live'}
                                    </span>
                                )}
                            </>
                        ) : (
                            <div className='flex flex-col items-center gap-1'>
                                <span className='text-xl font-bold text-[#9ca3af]'>vs</span>
                            </div>
                        )}
                    </div>

                    {/* Away */}
                    <div className='flex-1 flex flex-col items-center gap-2.5 min-w-0'>
                        <div className='relative w-12 h-12 shrink-0'>
                            <Image src={teams.away.logo} alt={teams.away.name} fill sizes='48px' className='object-contain' />
                        </div>
                        <span className='text-sm font-semibold text-white text-center leading-tight px-1 truncate max-w-full'>
                            {teams.away.name}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                {(league.round || fixture.venue.name) && (
                    <div className='px-5 pb-4 flex items-center justify-between'>
                        <span className='text-xs text-[#6b7280]'>{league.round}</span>
                        {fixture.venue.name && (
                            <span className='text-xs text-[#6b7280] truncate max-w-40'>{fixture.venue.name}</span>
                        )}
                    </div>
                )}
            </motion.div>
        </Link>
    )
}
