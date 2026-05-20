import React from 'react'
import DesktopNavigation from './DesktopNavigation'
import MobileNavigation from './MobileNavigation'

const Navigation = () => {
    return (
        <>
            <div className='hidden md:block'>
                <DesktopNavigation />
            </div>
            <div className='block md:hidden'>
                <MobileNavigation />
            </div>
        </>
    )
}

export default Navigation
