"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface CartItemProps {
  id: string
  name: string
  tld: string
  price: number
  onRemove?: () => void
}

export function CartItem({ id, name, tld, price, onRemove }: CartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const supabase = createClient()

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", id)

      if (error) throw error
      onRemove?.()
    } catch (err) {
      console.error("Error removing from cart:", err)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded bg-card hover:border-primary/50 transition-colors">
      <div className="flex-1">
        <h3 className="font-medium tracking-tight">
          {name}.{tld}
        </h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-lg font-light">${price.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">/year</p>
        </div>
        <Button
          onClick={handleRemove}
          disabled={isRemoving}
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
