import { LayoutDashboard, Trophy, Newspaper, Radio, ArrowRightLeft, Users, Search } from "lucide-react";

const navlinks = [
    { label: "Home", href: "/", icon: LayoutDashboard },
    { label: "Leagues", href: "/leagues", icon: Trophy },
    { label: "Live", href: "/live", icon: Radio },
    { label: "Teams", href: "/teams", icon: Users },
    { label: "Transfers", href: "/transfers", icon: ArrowRightLeft },
    { label: "News", href: "/news", icon: Newspaper },
]

export const rightNavlinks: { label: string; href: string; icon: any }[] = [
    { label: "Search", href: "/teams", icon: Search },
]

export default navlinks