"use client"

import React, { useEffect, useState } from 'react'
import NewsCard from '../ui/NewsCard'

type Article = {
    title: string
    url: string
    image: string | null
    publishedAt: string
    source: string
    category: string
}

const TABS = ['All', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Europe']

export default function NewsSection() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [activeTab, setActiveTab] = useState('All')

    useEffect(() => {
        fetch('/api/news')
            .then(res => res.json())
            .then(data => {
                setArticles(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => {
                setError(true)
                setLoading(false)
            })
    }, [])

    const filtered = activeTab === 'All'
        ? articles.slice(0, 9)
        : articles.filter(a => a.category === activeTab)

    return (
        <section className='w-full py-16 px-4'>
            <div className='max-w-7xl mx-auto'>

                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <div>
                        <h2 className='text-2xl font-bold text-white'>Latest News</h2>
                        <p className='text-sm text-[#9ca3af] mt-1'>From BBC Sport, Sky Sports, Guardian & more</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className='flex items-center gap-2 mb-8 overflow-x-auto pb-1'>
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
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className='glass rounded-2xl h-64 animate-pulse' />
                        ))}
                    </div>
                ) : error ? (
                    <div className='text-center text-[#9ca3af] py-12'>Failed to load news</div>
                ) : filtered.length === 0 ? (
                    <div className='text-center text-[#9ca3af] py-12'>No articles found</div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {filtered.map((article, i) => (
                            <NewsCard key={i} {...article} />
                        ))}
                    </div>
                )}

            </div>
        </section>
    )
}
