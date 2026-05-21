"use client"

import React from 'react'
import Image from 'next/image'

type Fixture = {
    fixture: {
        id: number
        date: string
        status: {
            long: string
            short: string
            elapsed: number | null
        }
        venue: {
            name: string
            city: string
        }
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
    goals: {
        home: number | null
        away: number | null
    }
}

const isLive = (short: string) => ['1H', '2H', 'ET', 'P', 'HT'].includes(short)

const formatDateTime = (date: string) => {
    const d = new Date(date)
    const isToday = new Date().toDateString() === d.toDateString()
    if (isToday) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function MatchCard({ fixture, league, teams, goals }: Fixture) {
    const live = isLive(fixture.status.short)

    return (
        <div className='glass rounded-2xl p-4 transition-all duration-200'>

            {/* League + Status */}
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                    {league.logo ? (
                        <div className='relative w-4 h-4 shrink-0'>
                            <Image src={league.logo} alt={league.name} fill sizes='16px' className='object-contain' />
                        </div>
                    ) : null}
                    <span className='text-xs text-[#9ca3af]'>{league.name}</span>
                </div>
                {live ? (
                    <span className='flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-[#FF4747]/15 text-[#FF4747] font-medium'>
                        <span className='w-1.5 h-1.5 rounded-full bg-[#FF4747] animate-live' />
                        {fixture.status.elapsed}&apos;
                    </span>
                ) : fixture.status.short === 'FT' ? (
                    <span className='text-xs text-[#9ca3af]'>Full Time</span>
                ) : (
                    <span className='text-xs text-[#9ca3af]'>{formatDateTime(fixture.date)}</span>
                )}
            </div>

            {/* Teams + Score */}
            <div className='flex items-center justify-between gap-4'>
                {/* Home */}
                <div className='flex flex-col items-center gap-2 flex-1'>
                    <div className='relative w-9 h-9 shrink-0'>
                        <Image src={teams.home.logo} alt={teams.home.name} fill sizes='36px' className='object-contain' />
                    </div>
                    <span className='text-xs text-white font-medium text-center'>{teams.home.name}</span>
                </div>

                {/* Score */}
                <div className='flex flex-col items-center'>
                    {live || fixture.status.short === 'FT' ? (
                        <span className='text-2xl font-bold text-white'>
                            {goals.home ?? 0} - {goals.away ?? 0}
                        </span>
                    ) : (
                        <span className='text-lg font-bold text-[#9ca3af]'>vs</span>
                    )}
                    <span className='text-xs text-[#9ca3af] mt-1'>{league.round}</span>
                </div>

                {/* Away */}
                <div className='flex flex-col items-center gap-2 flex-1'>
                    <div className='relative w-9 h-9 shrink-0'>
                        <Image src={teams.away.logo} alt={teams.away.name} fill sizes='36px' className='object-contain' />
                    </div>
                    <span className='text-xs text-white font-medium text-center'>{teams.away.name}</span>
                </div>
            </div>

            {/* Venue */}
            <div className='mt-4 pt-3 border-t border-white/5 text-center'>
                <span className='text-xs text-[#9ca3af]'>{fixture.venue.name}, {fixture.venue.city}</span>
            </div>

        </div>
    )
}
