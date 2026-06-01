"use client"

import Image from 'next/image'
import Link from 'next/link'

type Entry = {
    rank: number
    team: { id: number; name: string; logo: string }
    points: number
    goalsDiff: number
    all: { played: number; win: number; draw: number; lose: number }
}

type Group = { name: string; entries: Entry[] }

function GroupTable({ group, leagueSlug }: { group: Group; leagueSlug?: string }) {
    return (
        <div className='glass rounded-2xl overflow-hidden'>
            <div className='px-4 py-3 border-b border-white/5'>
                <span className='text-sm font-bold text-white'>{group.name}</span>
            </div>
            <table className='w-full text-xs'>
                <thead>
                    <tr className='text-[#6b7280] border-b border-white/5'>
                        <th className='text-left py-2 pl-4 w-6'>#</th>
                        <th className='text-left py-2 pl-2'>Team</th>
                        <th className='text-center py-2 w-7'>P</th>
                        <th className='text-center py-2 w-7'>W</th>
                        <th className='text-center py-2 w-7'>D</th>
                        <th className='text-center py-2 w-7'>L</th>
                        <th className='text-center py-2 w-8'>GD</th>
                        <th className='text-center py-2 w-8 font-bold text-white'>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {group.entries.map((row, i) => (
                        <tr key={row.team.id} className={`border-b border-white/3 hover:bg-white/5 transition-colors ${i < 2 ? 'border-l-2 border-l-[#00F5D4]' : 'border-l-2 border-l-transparent'}`}>
                            <td className='py-2.5 pl-3 text-[#9ca3af]'>{row.rank || i + 1}</td>
                            <td className='py-2.5 pl-2'>
                                <Link
                                    href={leagueSlug ? `/team/${row.team.id}?league=${leagueSlug}` : '#'}
                                    className='flex items-center gap-2 hover:opacity-80 transition-opacity'
                                >
                                    {row.team.logo ? (
                                        <div className='relative w-5 h-5 shrink-0'>
                                            <Image src={row.team.logo} alt={row.team.name} fill sizes='20px' className='object-contain' />
                                        </div>
                                    ) : (
                                        <div className='w-5 h-5 rounded-full bg-white/10 shrink-0' />
                                    )}
                                    <span className='text-white font-medium truncate max-w-[100px]'>{row.team.name}</span>
                                </Link>
                            </td>
                            <td className='py-2.5 text-center text-[#9ca3af]'>{row.all.played}</td>
                            <td className='py-2.5 text-center text-[#9ca3af]'>{row.all.win}</td>
                            <td className='py-2.5 text-center text-[#9ca3af]'>{row.all.draw}</td>
                            <td className='py-2.5 text-center text-[#9ca3af]'>{row.all.lose}</td>
                            <td className='py-2.5 text-center text-[#9ca3af]'>{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</td>
                            <td className='py-2.5 text-center text-white font-bold'>{row.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default function GroupStandings({ groups, leagueSlug }: { groups: Group[]; leagueSlug?: string }) {
    return (
        <div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {groups.map(group => (
                    <GroupTable key={group.name} group={group} leagueSlug={leagueSlug} />
                ))}
            </div>
            <div className='flex items-center gap-2 mt-3 px-1'>
                <span className='flex items-center gap-1.5 text-xs text-[#9ca3af]'>
                    <span className='w-2 h-2 rounded-sm bg-[#00F5D4]' /> Advance to Round of 32
                </span>
            </div>
        </div>
    )
}
