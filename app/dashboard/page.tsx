"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Package } from "lucide-react"

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  order_items: Array<{
    id: string
    domain_id: string
    price_at_purchase: number
    domains: {
      name: string
      tld: string
    }
  }>
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)

      try {
        const { data: ordersData, error } = await supabase
          .from("orders")
          .select(`
            id,
            total_amount,
            status,
            created_at,
            order_items(
              id,
              domain_id,
              price_at_purchase,
              domains(name, tld)
            )
          `)
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setOrders(ordersData || [])
      } catch (err) {
        console.error("Error loading orders:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <div className="mb-8">
              <h1 className="text-4xl font-light tracking-tight">My Domains</h1>
              <p className="text-muted-foreground mt-2">View and manage your purchased domains</p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-card border border-border rounded animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card className="border border-border p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-light mb-2">No domains yet</h2>
                <p className="text-muted-foreground">You haven't purchased any domains yet. Start shopping now!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border border-border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                        <p className="text-sm text-muted-foreground">
                          Ordered on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <div className="space-y-2 mb-4">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.domains?.name}.{item.domains?.tld}
                            </span>
                            <span className="font-medium">${item.price_at_purchase.toFixed(2)}/year</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-semibold border-t border-border pt-4">
                        <span>Total</span>
                        <span>${order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
