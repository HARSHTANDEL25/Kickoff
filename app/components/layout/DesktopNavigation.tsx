"use client"

import React, { useEffect, useState } from 'react'
import navlinks, { rightNavlinks } from '@/app/lib/data/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

type NavLink = { label: string; href: string; icon: React.ElementType }

const DesktopNavigation = () => {
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className='w-full fixed top-0 z-50 px-6 pt-4'>
            <div className={`max-w-300 mx-auto rounded-2xl transition-all duration-300 ${
                scrolled
                    ? 'bg-[#09090b]/90 backdrop-blur-xl border border-white/5 shadow-lg'
                    : 'bg-transparent border border-transparent'
            }`}>
                <div className='flex items-center justify-between glass rounded-xl h-14 px-6'>

                    {/* Logo */}
                    <Link href="/" className='text-xl font-black tracking-tight'>
                        <span className='text-white'>Kick</span>
                        <span className='gradient-text'>Off</span>
                    </Link>

                    {/* Center Nav */}
                    <div className='hidden md:flex items-center gap-1'>
                        {navlinks?.map((nav: NavLink, index: number) => {
                            const isActive = pathname === nav.href
                            return (
                                <Link
                                    key={index}
                                    href={nav.href}
                                    className={`relative px-4 py-2 rounded-lg text-md font-medium transition-colors duration-200 group
                                        ${isActive ? 'text-white' : 'text-[#9ca3af] hover:text-white'}`}
                                >
                                    <span className='flex items-center gap-1.5 '>
                                        {nav.label === 'Live' && (
                                            <span className='w-1.5 h-1.5 rounded-full bg-[#FF4747] animate-live' />
                                        )}
                                        {nav.label}
                                    </span>
                                    <span className={`absolute bottom-0 left-3 right-3 h-px transition-transform duration-300 origin-left
                                        ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                                        style={{ background: 'var(--accent)' }}
                                    />
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right — icons + avatar */}
                    <div className='flex items-center gap-1'>
                        {rightNavlinks?.map((nav: NavLink, index: number) => {
                            const Icon = nav.icon
                            return (
                                <Link
                                    key={index}
                                    href={nav.href}
                                    className='p-2 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/5 transition-all duration-200'
                                >
                                    <Icon size={18} />
                                </Link>
                            )
                        })}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default DesktopNavigation;
