"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Globe, Users, ShoppingCart, TrendingUp } from "lucide-react"

interface Stats {
  totalDomains: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadStats = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single()

      if (profileError || !profile?.is_admin) {
        router.push("/")
        return
      }

      setIsAdmin(true)

      try {
        // Fetch stats
        const [{ count: domainsCount }, { count: usersCount }, { count: ordersCount }, { data: ordersData }] =
          await Promise.all([
            supabase.from("domains").select("*", { count: "exact" }),
            supabase.from("profiles").select("*", { count: "exact" }),
            supabase.from("orders").select("*", { count: "exact" }),
            supabase.from("orders").select("total_amount"),
          ])

        const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

        setStats({
          totalDomains: domainsCount || 0,
          totalUsers: usersCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue,
        })
      } catch (err) {
        console.error("Error loading stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const statCards = [
    {
      label: "Total Domains",
      value: stats?.totalDomains || 0,
      icon: Globe,
      color: "text-blue-500",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-green-500",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-purple-500",
    },
    {
      label: "Total Revenue",
      value: `$${stats?.totalRevenue.toFixed(2) || "0.00"}`,
      icon: TrendingUp,
      color: "text-amber-500",
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <div className="mb-8">
              <h1 className="text-4xl font-light tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">Overview of your domain marketplace</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-card border border-border rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <Card
                      key={stat.label}
                      className="border border-border p-6 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                          <p className="text-3xl font-light mt-2">{stat.value}</p>
                        </div>
                        <Icon className={`w-8 h-8 opacity-30 ${stat.color}`} />
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
