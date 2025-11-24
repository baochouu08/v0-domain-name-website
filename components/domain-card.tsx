"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ShoppingCart, Check, Globe } from "lucide-react"

interface DomainCardProps {
  id: string
  name: string
  description: string
  price: number
  tld: string
  onAddToCart?: () => void
}

export function DomainCard({ id, name, description, price, tld, onAddToCart }: DomainCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAddToCart = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data?.user) {
      router.push("/auth/login")
      return
    }

    setIsAdding(true)

    try {
      const { error } = await supabase.from("cart_items").insert({
        user_id: data.user.id,
        domain_id: id,
      })

      if (error) {
        if (error.code === "23505") {
          setIsAdded(true)
        } else {
          throw error
        }
      } else {
        setIsAdded(true)
        onAddToCart?.()
      }

      setTimeout(() => setIsAdded(false), 2000)
    } catch (err) {
      console.error("Error adding to cart:", err)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Card className="group flex flex-col h-full border border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 overflow-hidden transition-all duration-200 bg-card">
      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary/5 to-transparent rounded-bl-2xl" />

      <div className="flex-1 p-3.5 sm:p-5 flex flex-col gap-2 sm:gap-3 relative z-10">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-secondary/10 text-secondary rounded-lg flex-shrink-0">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight truncate">
              {name}.{tld}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-baseline gap-1 pt-2 sm:pt-3 border-t border-border">
          <span className="text-xl sm:text-2xl font-bold text-primary">${price.toFixed(2)}</span>
          <span className="text-xs sm:text-sm text-muted-foreground">/year</span>
        </div>
      </div>

      <div className="p-3.5 sm:p-5 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isAdding || isAdded}
          className="w-full text-xs sm:text-sm transition-all duration-200 h-9 sm:h-10"
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Added to Cart</span>
              <span className="sm:hidden">Added</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
