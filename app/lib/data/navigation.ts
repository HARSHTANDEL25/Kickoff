import { LayoutDashboard, Trophy, Newspaper, Radio, ArrowRightLeft } from "lucide-react";

const navlinks = [
    { label: "Home", href: "/", icon: LayoutDashboard },
    { label: "Leagues", href: "/leagues", icon: Trophy },
    { label: "Live", href: "/live", icon: Radio },
    { label: "Transfers", href: "/transfers", icon: ArrowRightLeft },
    { label: "News", href: "/news", icon: Newspaper },
]

export const rightNavlinks: { label: string; href: string; icon: any }[] = []

export default navlinks