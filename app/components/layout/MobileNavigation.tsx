"use client";

import navlinks from "@/app/lib/data/navigation";
import {
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const MobileNavigation = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      <div className="fixed top-0 w-full z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5">
        {/* Top Bar */}
        <div className="flex justify-between items-center px-4 h-14">
          {/* Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-95"
          >
            {open ? (
              <X size={20} className="text-white" />
            ) : (
              <Menu size={20} className="text-[#9ca3af]" />
            )}
          </button>

          {/* Logo */}
          <span className="text-lg font-black tracking-tight">
            <span className="text-white">Kick</span>
            <span className="gradient-text">Off</span>
          </span>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-95">
              <Search size={18} className="text-[#9ca3af]" />
            </button>

            <button className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-95">
              <User size={18} className="text-[#9ca3af]" />
            </button>
          </div>
        </div>

        {/* Dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            open
              ? "max-h-[800px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col w-full px-3 pb-5 pt-2 gap-1">
            {navlinks?.map((nav) => {
              const isActive = pathname === nav?.href;

              return (
                <Link
                  key={nav.href}
                  href={nav?.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center justify-between p-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? "text-white bg-[#00F5D4]/10 border-[#00F5D4]/20"
                      : "text-[#9ca3af] border-transparent hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{nav?.label}</span>

                  <span
                    className={`h-2 w-2 rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-[#00F5D4]"
                        : "bg-transparent group-hover:bg-white/30"
                    }`}
                  />
                </Link>
              );
            })}

            {/* CTA Button */}
            <button className="mt-3 w-full rounded-xl bg-[#00F5D4] text-black font-semibold py-3 text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;