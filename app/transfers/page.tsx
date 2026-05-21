"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import FootballLoader from '../components/ui/FootballLoader'

type Transfer = {
    title: string
    url: string
    image: string | null
    publishedAt: string
    source: string
    league: string
    description: string
}

const TABS = ['All', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Europe']

const timeAgo = (date: string) => {
    let parsed = new Date(date)
    if (isNaN(parsed.getTime())) {
        parsed = new Date(date.replace(/\s[A-Z]{2,4}$/, ' +0000'))
    }
    if (isNaN(parsed.getTime())) return ''
    const diff = Date.now() - parsed.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

function TransferCard({ title, url, image, publishedAt, source, league, description, index }: Transfer & { index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
        >
            <Link
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                className='group glass rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-200 flex flex-col h-full'
            >
                {/* Image */}
                <div className='relative w-full h-44 bg-[var(--elevated)] overflow-hidden shrink-0'>
                    {image ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className='object-cover group-hover:scale-105 transition-transform duration-500'
                            unoptimized
                        />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                            <span className='text-4xl'>🔄</span>
                        </div>
                    )}
                    <div className='absolute top-3 left-3 flex items-center gap-2'>
                        <span className='px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white font-medium'>
                            {source}
                        </span>
                        <span className='px-2 py-1 rounded-md bg-[#00F5D4]/20 backdrop-blur-sm text-xs text-[#00F5D4] font-medium'>
                            {league}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className='flex flex-col flex-1 p-4'>
                    <h3 className='text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors duration-200 mb-2'>
                        {title}
                    </h3>
                    {description && (
                        <p className='text-xs text-[#9ca3af] line-clamp-2 leading-relaxed'>
                            {description}
                        </p>
                    )}
                    <div className='mt-auto pt-3 flex items-center justify-between'>
                        <span className='text-xs text-[#9ca3af]'>{source}</span>
                        <span className='text-xs text-[#9ca3af]'>{timeAgo(publishedAt)}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<Transfer[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('All')

    useEffect(() => {
        fetch('/api/transfers')
            .then(r => r.json())
            .then(data => {
                setTransfers(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const filtered = activeTab === 'All'
        ? transfers
        : transfers.filter(t => t.league === activeTab)

    return (
        <div className='min-h-screen w-full px-4 py-12'>
            <div className='max-w-7xl mx-auto'>

                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-white'>Transfers</h1>
                    <p className='text-sm text-[#9ca3af] mt-1'>Latest deals, rumours & signings</p>
                </div>

                {/* Tabs */}
                <div className='flex items-center gap-2 mb-8 overflow-x-auto pb-1 no-scrollbar'>
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
                    <FootballLoader text='Fetching transfer news...' />
                ) : filtered.length === 0 ? (
                    <div className='glass rounded-2xl p-16 text-center'>
                        <p className='text-2xl mb-2'>🔄</p>
                        <p className='text-white font-semibold mb-1'>No transfer news</p>
                        <p className='text-sm text-[#9ca3af]'>
                            {activeTab === 'All' ? 'Check back soon' : `No ${activeTab} transfer news right now`}
                        </p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {filtered.map((t, i) => (
                            <TransferCard key={t.url} {...t} index={i} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}
