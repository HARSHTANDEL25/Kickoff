"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import FootballLoader from '../components/ui/FootballLoader'

type Article = {
    title: string
    url: string
    image: string | null
    publishedAt: string
    source: string
    category: string
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

function FeaturedCard({ article }: { article: Article }) {
    return (
        <Link
            href={article.url}
            target='_blank'
            rel='noopener noreferrer'
            className='group relative glass rounded-2xl overflow-hidden flex flex-col md:flex-row hover:border-white/10 transition-all duration-200'
        >
            <div className='relative w-full md:w-2/5 h-56 md:h-auto bg-[var(--elevated)] shrink-0 overflow-hidden'>
                {article.image ? (
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className='object-cover group-hover:scale-105 transition-transform duration-500'
                        unoptimized
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                        <span className='text-5xl'>⚽</span>
                    </div>
                )}
                <div className='absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white font-medium'>
                    {article.source}
                </div>
            </div>
            <div className='flex flex-col justify-center p-6 flex-1'>
                <span className='text-xs text-[#00F5D4] font-semibold uppercase tracking-widest mb-3'>{article.category}</span>
                <h2 className='text-xl font-bold text-white leading-snug group-hover:text-[var(--accent)] transition-colors duration-200 mb-3'>
                    {article.title}
                </h2>
                <div className='flex items-center gap-3 mt-auto'>
                    <span className='text-xs text-[#9ca3af]'>{article.source}</span>
                    <span className='w-1 h-1 rounded-full bg-[#4b5563]' />
                    <span className='text-xs text-[#9ca3af]'>{timeAgo(article.publishedAt)}</span>
                </div>
            </div>
        </Link>
    )
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
        >
            <Link
                href={article.url}
                target='_blank'
                rel='noopener noreferrer'
                className='group glass rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-200 flex flex-col h-full'
            >
                <div className='relative w-full h-44 bg-[var(--elevated)] shrink-0 overflow-hidden'>
                    {article.image ? (
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className='object-cover group-hover:scale-105 transition-transform duration-500'
                            unoptimized
                        />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                            <span className='text-4xl'>⚽</span>
                        </div>
                    )}
                    <div className='absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white font-medium'>
                        {article.source}
                    </div>
                </div>
                <div className='flex flex-col flex-1 p-4'>
                    <h3 className='text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors duration-200'>
                        {article.title}
                    </h3>
                    <div className='mt-auto pt-3 flex items-center justify-between'>
                        <span className='text-xs text-[#9ca3af]'>{article.category}</span>
                        <span className='text-xs text-[#9ca3af]'>{timeAgo(article.publishedAt)}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export default function NewsPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('All')

    useEffect(() => {
        fetch('/api/news')
            .then(r => r.json())
            .then(data => {
                setArticles(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const filtered = activeTab === 'All'
        ? articles
        : articles.filter(a => a.category === activeTab)

    const featured = filtered[0]
    const rest = filtered.slice(1)

    return (
        <div className='min-h-screen w-full px-4 py-12'>
            <div className='max-w-7xl mx-auto'>

                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-white'>News</h1>
                    <p className='text-sm text-[#9ca3af] mt-1'>BBC Sport, Sky Sports, Guardian, ESPN & more</p>
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

                {loading ? (
                    <FootballLoader text='Fetching latest news...' />
                ) : filtered.length === 0 ? (
                    <div className='glass rounded-2xl p-16 text-center'>
                        <p className='text-2xl mb-2'>📰</p>
                        <p className='text-white font-semibold mb-1'>No articles found</p>
                        <p className='text-sm text-[#9ca3af]'>No {activeTab} news right now</p>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {/* Featured top story */}
                        {featured && <FeaturedCard article={featured} />}

                        {/* Rest of articles */}
                        {rest.length > 0 && (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                {rest.map((article, i) => (
                                    <ArticleCard key={article.url + i} article={article} index={i} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}
