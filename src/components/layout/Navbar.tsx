"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, X, Leaf, ChevronDown, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isHero = pathname === "/";
  const isTransparent = isHero && !isScrolled;

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "G";

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isTransparent
            ? "bg-transparent"
            : "bg-garden-cream/95 backdrop-blur-md border-b border-garden-earth-light shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="GardenGenius Home"
            >
              <div className="w-8 h-8 bg-garden-green rounded-lg flex items-center justify-center group-hover:bg-garden-green-dark transition-colors">
                <Leaf className="w-5 h-5 text-garden-cream" />
              </div>
              <span
                className={cn(
                  "font-display font-bold text-xl transition-colors",
                  isTransparent ? "text-garden-cream" : "text-garden-forest"
                )}
              >
                GardenGenius
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium font-body transition-colors",
                    isTransparent
                      ? "text-garden-cream/90 hover:text-garden-cream hover:bg-white/10"
                      : "text-garden-forest hover:text-garden-green hover:bg-garden-cream-dark"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-garden-cream-dark transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image ?? ""} alt={session.user?.name ?? ""} />
                      <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "text-sm font-medium max-w-[120px] truncate",
                      isTransparent ? "text-garden-cream" : "text-garden-forest"
                    )}>
                      {session.user?.name?.split(" ")[0] ?? "Garden"}
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      isUserMenuOpen && "rotate-180",
                      isTransparent ? "text-garden-cream/70" : "text-garden-earth"
                    )} />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-garden-earth-light z-20 py-1 overflow-hidden">
                        <div className="px-4 py-2 border-b border-garden-earth-light">
                          <p className="text-xs text-muted-foreground font-body">Signed in as</p>
                          <p className="text-sm font-medium text-garden-forest truncate">{session.user?.email}</p>
                        </div>
                        <Link
                          href="/plans"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-garden-forest hover:bg-garden-cream-dark font-body"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-garden-green" />
                          My Plans
                        </Link>
                        <Link
                          href="/design"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-garden-forest hover:bg-garden-cream-dark font-body"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Leaf className="w-4 h-4 text-garden-green" />
                          New Design
                        </Link>
                        <div className="border-t border-garden-earth-light mt-1">
                          <button
                            onClick={() => { signOut({ callbackUrl: "/" }); setIsUserMenuOpen(false); }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-body"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button
                      variant={isTransparent ? "cream" : "outline"}
                      size="sm"
                      className={isTransparent ? "border-white/50 bg-white/10 text-white hover:bg-white/20 hover:border-white" : ""}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/design">
                    <Button variant="garden" size="sm">
                      Start Free
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={cn(
                "md:hidden p-2 rounded-lg transition-colors",
                isTransparent
                  ? "text-garden-cream hover:bg-white/10"
                  : "text-garden-forest hover:bg-garden-cream-dark"
              )}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-garden-earth-light">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-garden-green rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-garden-cream" />
                </div>
                <span className="font-display font-bold text-lg text-garden-forest">GardenGenius</span>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-1 rounded-lg hover:bg-garden-cream-dark">
                <X className="w-5 h-5 text-garden-forest" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-garden-forest hover:bg-garden-cream-dark hover:text-garden-green font-body transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {session && (
                <>
                  <div className="border-t border-garden-earth-light pt-3 mt-3">
                    <Link
                      href="/plans"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-garden-forest hover:bg-garden-cream-dark font-body"
                    >
                      <LayoutDashboard className="w-4 h-4 text-garden-green" />
                      My Plans
                    </Link>
                  </div>
                </>
              )}
            </nav>

            <div className="p-4 border-t border-garden-earth-light space-y-2">
              {session ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image ?? ""} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-garden-forest">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="block">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/design" className="block">
                    <Button variant="garden" className="w-full">Start Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
