"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Leaf, Twitter, Instagram, Youtube, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  Product: [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Design Studio", href: "/design" },
    { label: "My Plans", href: "/plans" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/gardengenius", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/gardengenius", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com/@gardengenius", label: "YouTube" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-garden-forest text-garden-cream/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-garden-green rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-garden-cream" />
              </div>
              <span className="font-display font-bold text-xl text-garden-cream">
                GardenGenius
              </span>
            </Link>
            <p className="text-sm text-garden-cream/60 leading-relaxed mb-6 max-w-xs font-body">
              AI-powered garden design for everyone. Create your dream perennial garden 
              in minutes with personalized planting plans, bloom calendars, and shopping lists.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mb-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-garden-cream/10 hover:bg-garden-green transition-colors flex items-center justify-center"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-sm font-semibold text-garden-cream mb-2 font-body">
                Garden tips in your inbox
              </p>
              {subscribed ? (
                <p className="text-sm text-garden-green font-body">
                  🌱 Thanks! You're on the list.
                </p>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-garden-cream/10 border-garden-cream/20 text-garden-cream placeholder:text-garden-cream/40 focus-visible:ring-garden-green"
                    required
                  />
                  <Button type="submit" size="icon" variant="garden">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-garden-cream text-sm mb-4 font-body uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-garden-cream/60 hover:text-garden-cream transition-colors font-body"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-garden-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-garden-cream/40 font-body">
            © {new Date().getFullYear()} GardenGenius. Made with 🌱 for garden lovers.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-garden-cream/40 hover:text-garden-cream/70 font-body">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-garden-cream/40 hover:text-garden-cream/70 font-body">
              Terms
            </Link>
            <Link href="/cookies" className="text-xs text-garden-cream/40 hover:text-garden-cream/70 font-body">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
