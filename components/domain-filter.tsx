"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface DomainFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  minPrice: number
  maxPrice: number
  onPriceChange: (min: number, max: number) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

export function DomainFilter({
  searchQuery,
  onSearchChange,
  minPrice,
  maxPrice,
  onPriceChange,
  sortBy,
  onSortChange,
}: DomainFilterProps) {
  const handleClearFilters = () => {
    onSearchChange("")
    onPriceChange(0, 100)
    onSortChange("name")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Search Domains</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search domain names..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Price Range</label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onPriceChange(Number(e.target.value), maxPrice)}
              className="bg-card border-border"
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onPriceChange(minPrice, Number(e.target.value))}
              className="bg-card border-border"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            ${minPrice} - ${maxPrice}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 bg-card border border-border rounded text-sm"
        >
          <option value="name">Name (A-Z)</option>
          <option value="price-low">Price (Low to High)</option>
          <option value="price-high">Price (High to Low)</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <Button onClick={handleClearFilters} variant="outline" className="w-full bg-transparent">
        <X className="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  )
}
