"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'

const Hero = () => {
    return (
        <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>

            {/* Background glow */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-15'
                    style={{ background: 'var(--accent)' }} />
                <div className='absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10'
                    style={{ background: '#3b82f6' }} />
            </div>

            {/* Content */}
            <div className='relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto'>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-[#9ca3af] tracking-widest uppercase'
                >
                    Your All-in-One Football Dashboard
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className='text-7xl md:text-9xl font-bold text-white leading-none tracking-tight mb-6'
                >
                    Kick<span style={{ color: 'var(--accent)' }}>Off</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className='text-[#9ca3af] text-lg md:text-xl max-w-md mb-10 leading-relaxed'
                >
                    Live scores, transfers, news and standings — all in one place.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className='flex items-center gap-4'
                >
                    <Link
                        href='/leagues'
                        className='px-8 py-3 rounded-xl font-bold text-black transition-all duration-200 hover:opacity-90 active:scale-95'
                        style={{ background: 'var(--accent)' }}
                    >
                        Explore Leagues
                    </Link>
                    <Link
                        href='/live'
                        className='px-8 py-3 rounded-xl font-bold text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 active:scale-95'
                    >
                        Live Scores
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className='flex items-center gap-10 mt-16 text-center'
                >
                    {[
                        { value: 'Top 5 European league', label: 'Leagues' },
                        { value: '8', label: 'News Sources' },
                        { value: '30s', label: 'Refresh Rate' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className='text-2xl font-bold' style={{ color: 'var(--accent)' }}>{stat.value}</div>
                            <div className='text-xs text-[#9ca3af] uppercase tracking-widest mt-1'>{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

            </div>
        </section>
    )
}

export default Hero
