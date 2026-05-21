"use client"

import { motion } from 'framer-motion'

export default function FootballLoader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className='flex flex-col items-center justify-center py-32 gap-8'>
            <div className='relative flex items-center justify-center'>
                {/* Outer glow */}
                <motion.div
                    className='absolute rounded-full'
                    style={{
                        width: 180,
                        height: 180,
                        background: 'radial-gradient(circle, rgba(0,245,212,0.15) 0%, transparent 70%)',
                    }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Inner ring */}
                <motion.div
                    className='absolute rounded-full border border-[#00F5D4]/20'
                    style={{ width: 120, height: 120 }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                />
                {/* Football emoji */}
                <motion.span
                    className='text-7xl select-none relative z-10'
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'block', lineHeight: 1 }}
                >
                    ⚽
                </motion.span>
            </div>

            {/* Text */}
            <div className='flex flex-col items-center gap-2'>
                <motion.p
                    className='text-base font-semibold text-white'
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {text}
                </motion.p>
                <div className='flex items-center gap-1.5'>
                    {[0, 1, 2].map(i => (
                        <motion.span
                            key={i}
                            className='w-1.5 h-1.5 rounded-full bg-[#00F5D4]'
                            animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
