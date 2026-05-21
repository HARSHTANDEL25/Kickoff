import Link from 'next/link'

const LINKS = [
    {
        heading: 'Pages',
        items: [
            { label: 'Home', href: '/' },
            { label: 'Leagues', href: '/leagues' },
            { label: 'Live', href: '/live' },
            { label: 'Transfers', href: '/transfers' },
            { label: 'News', href: '/news' },
        ],
    },
    {
        heading: 'Leagues',
        items: [
            { label: 'Premier League', href: '/leagues' },
            { label: 'La Liga', href: '/leagues' },
            { label: 'Serie A', href: '/leagues' },
            { label: 'Bundesliga', href: '/leagues' },
            { label: 'Ligue 1', href: '/leagues' },
        ],
    },
    {
        heading: 'European',
        items: [
            { label: 'Champions League', href: '/leagues' },
            { label: 'Europa League', href: '/leagues' },
            { label: 'Conference League', href: '/leagues' },
        ],
    },
]

export default function Footer() {
    return (
        <footer className='border-t border-white/5 mt-20'>
            <div className='max-w-7xl mx-auto px-6 py-14'>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-10 mb-12'>

                    {/* Brand */}
                    <div className='col-span-2 md:col-span-1'>
                        <div className='text-2xl font-black tracking-tight mb-3'>
                            <span className='text-white'>Kick</span>
                            <span className='text-[#00f5d4]'>Off</span>
                        </div>
                        <p className='text-sm text-[#6b7280] leading-relaxed max-w-[200px]'>
                            Live scores, transfers, news and standings — all in one place.
                        </p>
                        
                    </div>

                    {/* Nav columns */}
                    {LINKS.map(col => (
                        <div key={col.heading}>
                            <p className='text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-4'>{col.heading}</p>
                            <ul className='space-y-2.5'>
                                {col.items.map(item => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className='text-sm text-[#6b7280] hover:text-white transition-colors duration-150'
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                </div>

                {/* Bottom bar */}
                <div className='border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3'>
                    <p className='text-xs text-[#4b5563]'>
                        © {new Date().getFullYear()} KickOff. Built with Next.js & ESPN API.
                    </p>
                    <p className='text-xs text-[#4b5563]'>
                        Data sourced from ESPN · BBC Sport · Sky Sports · The Guardian
                    </p>
                </div>

            </div>
        </footer>
    )
}
