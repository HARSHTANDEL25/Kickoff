import { LayoutDashboard, Trophy, Newspaper, Users, Search, Radio, ArrowRightLeft } from "lucide-react";

const navlinks = [
    { label: "Home", href: "/", icon: LayoutDashboard },
    { label: "Leagues", href: "/leagues", icon: Trophy },
    { label: "Live", href: "/live", icon: Radio },
    { label: "Transfers", href: "/transfers", icon: ArrowRightLeft },
    { label: "News", href: "/news", icon: Newspaper },
]


export const rightNavlinks = [
    { label: "Search", href: "/search", icon: Search },
    { label: "Profile", href: "/profile", icon: Users },

]

export default navlinks