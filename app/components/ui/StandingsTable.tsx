"use client"

import Image from 'next/image'

type Standing = {
    rank: number
    team: { id: number; name: string; logo: string }
    points: number
    goalsDiff: number
    all: { played: number; win: number; draw: number; lose: number }
}

const getRowAccent = (rank: number) => {
    if (rank <= 4) return 'border-l-2 border-l-[#00F5D4]'
    if (rank === 5) return 'border-l-2 border-l-[#f97316]'
    if (rank >= 18) return 'border-l-2 border-l-[#FF4747]'
    return 'border-l-2 border-l-transparent'
}

const FormDot = ({ result }: { result: string }) => {
    const color = result === 'W' ? 'bg-[#00F5D4]' : result === 'D' ? 'bg-[#9ca3af]' : 'bg-[#FF4747]'
    return <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
}

export default function StandingsTable({ standings }: { standings: Standing[] }) {
    return (
        <div className='w-full overflow-x-auto'>
            <table className='w-full text-sm'>
                <thead>
                    <tr className='text-[#9ca3af] text-xs border-b border-white/5'>
                        <th className='text-left py-2 pl-3 w-8'>#</th>
                        <th className='text-left py-2 pl-2'>Club</th>
                        <th className='text-center py-2 w-8'>P</th>
                        <th className='text-center py-2 w-8'>W</th>
                        <th className='text-center py-2 w-8'>D</th>
                        <th className='text-center py-2 w-8'>L</th>
                        <th className='text-center py-2 w-10'>GD</th>
                        <th className='text-center py-2 w-10 font-bold text-white'>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((row) => (
                        <tr
                            key={row.rank}
                            className={`${getRowAccent(row.rank)} hover:bg-white/5 transition-colors duration-150 border-b border-white/3 `}
                        >
                            <td className='py-2.5 pl-3 text-[#9ca3af] text-xs'>{row.rank}</td>
                            <td className='py-2.5 pl-2'>
                                <div className='flex items-center gap-2'>
                                    <div className='relative w-5 h-5 shrink-0'>
                                        <Image src={row.team.logo} alt={row.team.name} fill sizes='20px' className='object-contain' />
                                    </div>
                                    <span className='text-white font-medium text-xs truncate max-w-30'>{row.team.name}</span>
                                </div>
                            </td>
                            <td className='py-2.5 text-center text-[#9ca3af] text-xs'>{row.all.played}</td>
                            <td className='py-2.5 text-center text-[#9ca3af] text-xs'>{row.all.win}</td>
                            <td className='py-2.5 text-center text-[#9ca3af] text-xs'>{row.all.draw}</td>
                            <td className='py-2.5 text-center text-[#9ca3af] text-xs'>{row.all.lose}</td>
                            <td className='py-2.5 text-center text-[#9ca3af] text-xs'>{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</td>
                            <td className='py-2.5 text-center text-white font-bold text-xs'>{row.points}</td>
                            <td className='py-2.5 hidden sm:table-cell'>
                                
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Legend */}
            <div className='flex items-center gap-4 mt-3 px-3 pb-1'>
                <span className='flex items-center gap-1.5 text-xs text-[#9ca3af]'><span className='w-2 h-2 rounded-sm bg-[#00F5D4]' /> Champions League</span>
                <span className='flex items-center gap-1.5 text-xs text-[#9ca3af]'><span className='w-2 h-2 rounded-sm bg-[#f97316]' /> Europa League</span>
                <span className='flex items-center gap-1.5 text-xs text-[#9ca3af]'><span className='w-2 h-2 rounded-sm bg-[#FF4747]' /> Relegation</span>
            </div>
        </div>
    )
}
