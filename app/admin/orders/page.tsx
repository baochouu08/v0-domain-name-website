"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  created_at: string
  profiles: {
    email: string
    first_name: string
    last_name: string
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadOrders = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single()

      if (!profile?.is_admin) {
        router.push("/")
        return
      }

      try {
        const { data: ordersData, error } = await supabase
          .from("orders")
          .select(`
            id,
            user_id,
            total_amount,
            status,
            created_at,
            profiles(email, first_name, last_name)
          `)
          .order("created_at", { ascending: false })

        if (error) throw error
        setOrders(ordersData || [])
      } catch (err) {
        console.error("Error loading orders:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
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
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <div className="mb-8">
              <h1 className="text-4xl font-light tracking-tight">Orders</h1>
              <p className="text-muted-foreground mt-2">View and manage all orders</p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-card border border-border rounded animate-pulse" />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium">Order ID</th>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Total</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-card/50">
                        <td className="p-4 font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">
                              {order.profiles?.first_name} {order.profiles?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
                          </div>
                        </td>
                        <td className="p-4 font-medium">${order.total_amount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="border border-border p-12 text-center">
                <p className="text-muted-foreground">No orders yet</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
