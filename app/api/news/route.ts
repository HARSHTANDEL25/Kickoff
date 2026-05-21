import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser({
    customFields: {
        item: ['media:content', 'media:thumbnail', 'enclosure', 'thumbnail', ['content:encoded', 'contentEncoded']]
    },
    timeout: 8000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
})

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Feed timed out after ${ms}ms`)), ms)
    )
    return Promise.race([promise, timeout])
}

const RSS_FEEDS = [
    { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', source: 'BBC Sport', category: 'Premier League' },
    { url: 'https://www.skysports.com/rss/12040', source: 'Sky Sports', category: 'Premier League' },
    { url: 'https://www.caughtoffside.com/feed/', source: 'CaughtOffside', category: 'Premier League' },
    { url: 'https://www.theguardian.com/football/rss', source: 'The Guardian', category: 'Europe' },
    { url: 'https://www.espn.com/espn/rss/soccer/news', source: 'ESPN FC', category: 'Europe' },
    { url: 'https://www.goal.com/feeds/en/news', source: 'Goal.com', category: 'Europe' },
    { url: 'https://e00-marca.uecdn.es/rss/en/football.xml', source: 'Marca', category: 'La Liga' },
    { url: 'https://www.football-italia.net/rss.xml', source: 'Football Italia', category: 'Serie A' },
    { url: 'https://www.getfootballnewsgermany.com/feed/', source: 'Get German Football News', category: 'Bundesliga' },
]

function extractImageFromHtml(html: string): string | null {
    if (!html) return null
    const match = html.match(/data-src="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/)
        || html.match(/src="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/)
    return match ? match[1].split(' ')[0] : null
}

function resolveCategory(title: string, defaultCategory: string): string {
    if (defaultCategory !== 'Europe') return defaultCategory
    const t = title.toLowerCase()
    if (t.includes('la liga') || t.includes('real madrid') || t.includes('barcelona') || t.includes('atletico') || t.includes('sevilla') || t.includes('villarreal')) return 'La Liga'
    if (t.includes('serie a') || t.includes('juventus') || t.includes('inter milan') || t.includes('ac milan') || t.includes('napoli') || t.includes('roma') || t.includes('lazio')) return 'Serie A'
    if (t.includes('bundesliga') || t.includes('bayern munich') || t.includes('borussia dortmund') || t.includes('bayer leverkusen')) return 'Bundesliga'
    if (t.includes('ligue 1') || t.includes('psg') || t.includes('paris saint-germain') || t.includes('monaco') || t.includes('marseille') || t.includes('lyon')) return 'Ligue 1'
    return 'Europe'
}

async function fetchESPNNews(): Promise<any[]> {
    const res = await fetch(
        'https://now.core.api.espn.com/v1/sports/news?sport=soccer&limit=50',
        { next: { revalidate: 300 } }
    )
    const data = await res.json()
    const headlines: any[] = data.headlines ?? []

    return headlines
        .filter((h: any) => h.links?.web?.href?.includes('/soccer/'))
        .map((h: any) => ({
            title: h.headline ?? '',
            url: h.links?.web?.href ?? '',
            image: h.images?.[0]?.url ?? null,
            publishedAt: h.published ?? '',
            source: 'ESPN FC',
            category: resolveCategory(h.headline ?? '', 'Europe'),
        }))
        .filter(a => a.title && a.url)
}

export async function GET() {
    try {
        const [rssResults, espnArticles] = await Promise.all([
            Promise.allSettled(
                RSS_FEEDS.map(async ({ url, source, category, filterUrl }: any) => {
                    const feed = await withTimeout(parser.parseURL(url), 8000)
                    const items = filterUrl
                        ? feed.items.filter(item => item.link?.includes(filterUrl))
                        : feed.items
                    return items.slice(0, 6).map(item => ({
                        title: item.title ?? '',
                        url: item.link ?? '',
                        image: (item as any)['media:content']?.$.url
                            || (item as any)['media:thumbnail']?.$.url
                            || (item as any).enclosure?.url
                            || (item as any).thumbnail
                            || extractImageFromHtml((item as any).contentEncoded || item.content || '')
                            || null,
                        publishedAt: item.pubDate ?? item.isoDate ?? '',
                        source,
                        category: resolveCategory(item.title ?? '', category),
                    }))
                })
            ),
            fetchESPNNews().catch(() => []),
        ])

        const rssArticles = rssResults
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => (r as PromiseFulfilledResult<any[]>).value)

        // Deduplicate ESPN against RSS by title prefix
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
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
    }
}
