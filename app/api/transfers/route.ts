import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser({
    customFields: {
        item: ['media:content', 'media:thumbnail', 'enclosure', ['content:encoded', 'contentEncoded']]
    },
    timeout: 8000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
})

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    )
    return Promise.race([promise, timeout])
}

// CaughtOffside is naturally transfer-focused; others are filtered by keywords
const FEEDS = [
    { url: 'https://www.caughtoffside.com/feed/', source: 'CaughtOffside', filterTransfers: false },
    { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', source: 'BBC Sport', filterTransfers: true },
    { url: 'https://www.skysports.com/rss/12040', source: 'Sky Sports', filterTransfers: true },
    { url: 'https://www.theguardian.com/football/rss', source: 'The Guardian', filterTransfers: true },
    { url: 'https://www.espn.com/espn/rss/soccer/news', source: 'ESPN FC', filterTransfers: true },
    { url: 'https://www.goal.com/feeds/en/news', source: 'Goal.com', filterTransfers: true },
    { url: 'https://www.football-italia.net/rss.xml', source: 'Football Italia', filterTransfers: true },
    { url: 'https://www.getfootballnewsgermany.com/feed/', source: 'Get German Football News', filterTransfers: true },
]

const TRANSFER_KEYWORDS = [
    'transfer', 'sign', 'signs', 'signed', 'joining', 'joins', 'joined',
    'deal', 'fee', 'loan', 'exit', 'leaves', 'departs', 'departure',
    'bid', 'target', 'approach', 'agree', 'agreed', 'contract',
    '£', '€', 'million', 'release clause', 'sell', 'sold', 'bought',
    'swap', 'permanent', 'window', 'rumour', 'linked'
]

const isTransferRelated = (title: string): boolean => {
    const t = title.toLowerCase()
    return TRANSFER_KEYWORDS.some(kw => t.includes(kw))
}

function resolveLeague(title: string): string {
    const t = title.toLowerCase()
    if (t.includes('la liga') || t.includes('real madrid') || t.includes('barcelona') || t.includes('atletico') || t.includes('sevilla')) return 'La Liga'
    if (t.includes('serie a') || t.includes('juventus') || t.includes('inter milan') || t.includes('ac milan') || t.includes('napoli') || t.includes('roma')) return 'Serie A'
    if (t.includes('bundesliga') || t.includes('bayern') || t.includes('dortmund') || t.includes('leverkusen') || t.includes('frankfurt')) return 'Bundesliga'
    if (t.includes('ligue 1') || t.includes('psg') || t.includes('paris saint-germain') || t.includes('monaco') || t.includes('marseille')) return 'Ligue 1'
    if (t.includes('arsenal') || t.includes('chelsea') || t.includes('liverpool') || t.includes('manchester') || t.includes('tottenham') || t.includes('premier league') || t.includes('newcastle') || t.includes('aston villa')) return 'Premier League'
    return 'Europe'
}

function extractImage(item: any): string | null {
    return item['media:content']?.$.url
        || item['media:thumbnail']?.$.url
        || item.enclosure?.url
        || (() => {
            const html = item.contentEncoded || item.content || ''
            const m = html.match(/data-src="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/) || html.match(/src="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/)
            return m ? m[1].split(' ')[0] : null
        })()
}

async function fetchESPNTransfers(): Promise<any[]> {
    const res = await fetch(
        'https://now.core.api.espn.com/v1/sports/news?sport=soccer&limit=50',
        { next: { revalidate: 300 } }
    )
    const data = await res.json()
    const headlines: any[] = data.headlines ?? []

    return headlines
        .filter((h: any) => {
            const link: string = h.links?.web?.href ?? ''
            const title: string = h.headline ?? ''
            return link.includes('/soccer/story/') && isTransferRelated(title)
        })
        .slice(0, 10)
        .map((h: any) => ({
            title: h.headline ?? '',
            url: h.links?.web?.href ?? '',
            image: h.images?.[0]?.url ?? null,
            publishedAt: h.published ?? '',
            source: 'ESPN FC',
            league: resolveLeague(h.headline ?? ''),
            description: h.description?.slice(0, 160) ?? '',
        }))
}

export async function GET() {
    try {
        const [rssResults, espnArticles] = await Promise.all([
            Promise.allSettled(
                FEEDS.map(async ({ url, source, filterTransfers }) => {
                    const feed = await withTimeout(parser.parseURL(url), 8000)
                    const items = filterTransfers
                        ? feed.items.filter(item => isTransferRelated(item.title ?? ''))
                        : feed.items
                    return items.slice(0, 8).map(item => ({
                        title: item.title ?? '',
                        url: item.link ?? '',
                        image: extractImage(item),
                        publishedAt: item.pubDate ?? item.isoDate ?? '',
                        source,
                        league: resolveLeague(item.title ?? ''),
                        description: item.contentSnippet?.slice(0, 160) || '',
                    }))
                })
            ),
            fetchESPNTransfers().catch(() => []),
        ])

        const rssArticles = rssResults
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => (r as PromiseFulfilledResult<any[]>).value)

        // Deduplicate ESPN articles against RSS by similar title
        const rssLower = new Set(rssArticles.map(a => a.title.toLowerCase().slice(0, 40)))
        const uniqueESPN = espnArticles.filter(
            a => !rssLower.has(a.title.toLowerCase().slice(0, 40))
        )

        const articles = [...rssArticles, ...uniqueESPN]
            .filter(a => a.title && a.url)
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

        return NextResponse.json(articles, {
            headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' }
        })

    } catch {
        return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 })
    }
}
