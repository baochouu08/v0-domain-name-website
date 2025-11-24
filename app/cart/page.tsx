"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { CartItem } from "@/components/cart-item"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, ShoppingCart } from "lucide-react"

interface CartItemData {
  id: string
  domain_id: string
  domains: {
    id: string
    name: string
    tld: string
    price: number
  }
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadCart = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)

      try {
        const { data: items, error } = await supabase
          .from("cart_items")
          .select("id, domain_id, domains(id, name, tld, price)")
          .eq("user_id", data.user.id)
          .order("added_at", { ascending: false })

        if (error) throw error
        setCartItems(items || [])
      } catch (err) {
        console.error("Error loading cart:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  const handleRemoveItem = async () => {
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      const { data: items } = await supabase
        .from("cart_items")
        .select("id, domain_id, domains(id, name, tld, price)")
        .eq("user_id", data.user.id)
        .order("added_at", { ascending: false })
      setCartItems(items || [])
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.domains?.price || 0), 0)

  const rentalCost = totalPrice
  const taxRate = 0.1
  const tax = rentalCost * taxRate
  const total = rentalCost + tax

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">
            {cartItems.length} domain{cartItems.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-card border border-border rounded animate-pulse" />
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <Card className="border border-border p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-light mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Browse our collection of premium domains to get started.</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Domains</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  id={item.id}
                  name={item.domains?.name}
                  tld={item.domains?.tld}
                  price={item.domains?.price}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border border-border p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rental Cost</span>
                    <span>${rentalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-light">${total.toFixed(2)}</span>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="outline" className="w-full mt-3 bg-transparent">
                    Continue Shopping
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
