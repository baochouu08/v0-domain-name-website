"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { CreditCard, ArrowLeft } from "lucide-react"

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

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItemData[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadCheckoutData = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)

      try {
        // Load cart items
        const { data: items } = await supabase
          .from("cart_items")
          .select("id, domain_id, domains(id, name, tld, price)")
          .eq("user_id", data.user.id)

        setCartItems(items || [])

        // Load user profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

        if (profile) {
          setFormData((prev) => ({
            ...prev,
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            city: profile.city || "",
            country: profile.country || "",
            postalCode: profile.postal_code || "",
          }))
        }
      } catch (err) {
        console.error("Error loading checkout data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCheckoutData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.domains?.price || 0), 0)

  const tax = totalPrice * 0.1
  const total = totalPrice + tax

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || cartItems.length === 0) {
      alert("Cart is empty or user not found")
      return
    }

    setIsProcessing(true)

    try {
      // Update user profile with billing info
      await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postal_code: formData.postalCode,
        })
        .eq("id", user.id)

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          status: "completed",
          payment_intent_id: `pi_${Date.now()}`,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        domain_id: item.domain_id,
        price_at_purchase: item.domains?.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      await supabase.from("cart_items").delete().eq("user_id", user.id)

      // Redirect to success page
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (err: unknown) {
      console.error("Error placing order:", err)
      alert(err instanceof Error ? err.message : "Failed to place order")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/cart" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-card border border-border rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-8">
                {/* Billing Information */}
                <Card className="border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Billing Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">First Name</Label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                          className="bg-card border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Last Name</Label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                          className="bg-card border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-card border-border opacity-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-card border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Address</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="bg-card border-border"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">City</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="bg-card border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Country</Label>
                        <Input
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          className="bg-card border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Postal Code</Label>
                      <Input
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        className="bg-card border-border"
                      />
                    </div>
                  </div>
                </Card>

                {/* Payment Information */}
                <Card className="border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Cardholder Name</Label>
                      <Input
                        value={formData.cardName}
                        onChange={(e) => handleInputChange("cardName", e.target.value)}
                        required
                        className="bg-card border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Card Number</Label>
                      <Input
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        required
                        className="bg-card border-border"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Expiry Date</Label>
                        <Input
                          value={formData.cardExpiry}
                          onChange={(e) => handleInputChange("cardExpiry", e.target.value)}
                          placeholder="MM/YY"
                          required
                          className="bg-card border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">CVC</Label>
                        <Input
                          value={formData.cardCVC}
                          onChange={(e) => handleInputChange("cardCVC", e.target.value)}
                          placeholder="123"
                          required
                          className="bg-card border-border"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-border max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.domains?.name}.{item.domains?.tld}
                    </span>
                    <span className="font-medium">${item.domains?.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-light">${total.toFixed(2)}</span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
