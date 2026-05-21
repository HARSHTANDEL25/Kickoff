"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

type NewsArticle = {
    title: string
    url: string
    image: string | null
    publishedAt: string
    source: string
}

const timeAgo = (date: string) => {
    let parsed = new Date(date)
    if (isNaN(parsed.getTime())) {
        // Fallback: replace non-standard tz abbreviations (BST, EST, etc.) with UTC
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

export default function NewsCard({ title, url, image, publishedAt, source }: NewsArticle) {
    return (
        <Link href={url} target='_blank' rel='noopener noreferrer'
            className='group glass rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-200 flex flex-col'>

            {/* Image */}
            <div className='relative w-full h-44 bg-[var(--elevated)] overflow-hidden'>
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
                        <span className='text-4xl'>⚽</span>
                    </div>
                )}
                {/* Source badge */}
                <div className='absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white font-medium'>
                    {source}
                </div>
            </div>

            {/* Content */}
            <div className='flex flex-col flex-1 p-4'>
                <h3 className='text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors duration-200'>
                    {title}
                </h3>
                <div className='mt-auto pt-3 flex items-center justify-between'>
                    <span className='text-xs text-[#9ca3af]'>{source}</span>
                    <span className='text-xs text-[#9ca3af]'>{timeAgo(publishedAt)}</span>
                </div>
            </div>

        </Link>
    )
}
