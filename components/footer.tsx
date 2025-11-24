"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold mb-4">DomainHub</h3>
            <p className="text-sm text-muted-foreground">Your trusted partner for premium domain names</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  Browse Domains
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  Features
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  Status
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>&copy; 2025 DomainHub. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/" className="hover:text-foreground transition">
              Twitter
            </Link>
            <Link href="/" className="hover:text-foreground transition">
              LinkedIn
            </Link>
            <Link href="/" className="hover:text-foreground transition">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
