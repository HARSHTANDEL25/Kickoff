"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'

type Team = { id: string; name: string; logo: string; score: number | null }
type Tie = { home: Team; away: Team; homeScore: number; awayScore: number; winner: 'home' | 'away' | null }
type Round = { name: string; ties: Tie[] }

function TieCard({ tie, index }: { tie: Tie; index: number }) {
    const homeWon = tie.winner === 'home'
    const awayWon = tie.winner === 'away'

    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
            className='glass rounded-2xl overflow-hidden w-72 shrink-0'
        >
            {[
                { team: tie.home, score: tie.homeScore, won: homeWon },
                { team: tie.away, score: tie.awayScore, won: awayWon },
            ].map(({ team, score, won }, i) => (
                <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-4 transition-colors duration-150
                        ${i === 0 ? 'border-b border-white/5' : ''}
                        ${won ? 'bg-[#00F5D4]/10' : 'hover:bg-white/5'}`}
                >
                    {team.logo ? (
                        <div className='relative w-9 h-9 shrink-0'>
                            <Image src={team.logo} alt={team.name} fill sizes='36px' className='object-contain' />
                        </div>
                    ) : (
                        <div className='w-9 h-9 rounded-full bg-white/10 shrink-0' />
                    )}
                    <span className={`text-sm flex-1 truncate ${won ? 'text-white font-bold' : 'text-[#9ca3af]'}`}>
                        {team.name || 'TBD'}
                    </span>
                    <span className={`text-lg font-black tabular-nums min-w-[2ch] text-right ${won ? 'text-[#00F5D4]' : 'text-[#9ca3af]'}`}>
                        {score ?? '-'}
                    </span>
                </div>
            ))}
        </motion.div>
    )
}

export default function KnockoutBracket({ rounds }: { rounds: Round[] }) {
    if (!rounds?.length) return null

    return (
        <div className='w-full overflow-x-auto pb-4'>
            <div className='flex gap-8 min-w-max px-2'>
                {rounds.map((round, ri) => {
                    const gapMultiplier = Math.pow(2, ri)
                    return (
                        <div key={round.name} className='flex flex-col'>
                            {/* Round label */}
                            <div className='text-sm font-bold text-[#00F5D4] mb-5 text-center w-72 tracking-wide uppercase'>
                                {round.name}
                            </div>

                            {/* Ties */}
                            <div className='flex flex-col' style={{ gap: `${gapMultiplier * 16}px` }}>
                                {round.ties.length > 0 ? (
                                    round.ties.map((tie, ti) => (
                                        <div key={ti} style={{ marginTop: ti === 0 ? `${(gapMultiplier - 1) * 8}px` : 0 }}>
                                            <TieCard tie={tie} index={ri * 4 + ti} />
                                        </div>
                                    ))
                                ) : (
                                    <div className='w-72 h-20 glass rounded-2xl flex items-center justify-center'>
                                        <span className='text-sm text-[#9ca3af]'>TBD</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
