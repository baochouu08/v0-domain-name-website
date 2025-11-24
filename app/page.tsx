"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { DomainCard } from "@/components/domain-card"
import { createClient } from "@/lib/supabase/client"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Search, Sparkles } from "lucide-react"

interface Domain {
  id: string
  name: string
  description: string
  price: number
  tld: string
  status: string
  created_at: string
}

const MOCK_DOMAINS: Domain[] = [
  {
    id: "1",
    name: "techvision",
    description: "Perfect for tech startups and innovators",
    price: 12.99,
    tld: "com",
    status: "available",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "cloudwave",
    description: "Great for cloud services and tech solutions",
    price: 8.99,
    tld: "com",
    status: "available",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "innovate",
    description: "Ideal for innovation-focused companies",
    price: 10.99,
    tld: "com",
    status: "available",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "digital",
    description: "Perfect for digital agencies and studios",
    price: 9.99,
    tld: "com",
    status: "available",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "nexus",
    description: "Connect your business with nexus domain",
    price: 11.99,
    tld: "com",
    status: "available",
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "velocity",
    description: "Fast-growing business domain",
    price: 12.99,
    tld: "com",
    status: "available",
    created_at: new Date().toISOString(),
  },
  {
    id: "7",
    name: "fusion",
    description: "Merge ideas and technology",
    price: 9.49,
    tld: "com",
    status: "available",
    created_at: new Date().toISOString(),
  },
  {
    id: "8",
    name: "horizon",
    description: "Expand your business horizons",
    price: 8.49,
    tld: "com",
    status: "available",
    created_at: new Date().toISOString(),
  },
  {
    id: "9",
    name: "spectrum",
    description: "Full spectrum business solutions",
    price: 13.99,
    tld: "com",
    status: "available",
    created_at: new Date().toISOString(),
  },
  {
    id: "10",
    name: "zenith",
    description: "Reach the peak of success",
    price: 11.49,
    tld: "com",
    status: "available",
    created_at: new Date().toISOString(),
  },
]

export default function Home() {
  const [searchInput, setSearchInput] = useState("")
  const [searchedDomains, setSearchedDomains] = useState<Domain[]>([])
  const [allDomains, setAllDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchAllDomains = async () => {
      try {
        const { data, error } = await supabase
          .from("domains")
          .select("*")
          .eq("status", "available")
          .order("price", { ascending: true })

        if (error || !data || data.length === 0) {
          setAllDomains(MOCK_DOMAINS)
          return
        }

        setAllDomains(data)
      } catch (err) {
        setAllDomains(MOCK_DOMAINS)
      }
    }

    fetchAllDomains()
  }, [supabase])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!searchInput.trim()) {
      setSearchedDomains([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const query = searchInput.toLowerCase().trim()

      const filtered = allDomains.filter((domain) => {
        const fullName = `${domain.name}.${domain.tld}`.toLowerCase()
        return (
          fullName.includes(query) ||
          domain.name.toLowerCase().includes(query) ||
          domain.tld.toLowerCase().includes(query)
        )
      })

      setSearchedDomains(filtered)
    } catch (err) {
      console.error("Error searching domains:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Hero Section with Search */}
        <div className="bg-gradient-to-b from-secondary/5 to-background px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Find your perfect domain
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                Find & Register Your Domain
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Search thousands of premium domains instantly. Register in seconds.
              </p>
            </div>

            <form onSubmit={handleSearch} className="w-full">
              <div className="flex gap-2 flex-col sm:flex-row">
                <div className="flex-1 relative order-1 sm:order-none">
                  <input
                    type="text"
                    placeholder="Search domain..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm sm:text-base transition-all duration-200 placeholder:text-muted-foreground"
                  />
                  <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 order-0 sm:order-none"
                >
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </form>

            {!hasSearched && (
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                <p>Try: "tech", "io", "startup", "cloud"</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
          {hasSearched && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {searchedDomains.length > 0 ? "Available Domains" : "No Results"}
                </h2>
                {searchedDomains.length > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    {searchedDomains.length} domain{searchedDomains.length !== 1 ? "s" : ""} found
                  </p>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 sm:h-40 bg-card border border-border rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : searchedDomains.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {searchedDomains.map((domain) => (
                    <DomainCard
                      key={domain.id}
                      id={domain.id}
                      name={domain.name}
                      description={domain.description}
                      price={domain.price}
                      tld={domain.tld}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 bg-card/50 border border-border rounded-lg">
                  <p className="text-base sm:text-lg font-medium mb-2">No domains found</p>
                  <p className="text-sm text-muted-foreground">Try a different search term</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
