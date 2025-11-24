"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Mail, User } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadUsers = async () => {
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
        const { data: usersData, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setUsers(usersData || [])
      } catch (err) {
        console.error("Error loading users:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <div className="mb-8">
              <h1 className="text-4xl font-light tracking-tight">Users</h1>
              <p className="text-muted-foreground mt-2">Manage user accounts and profiles</p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-card border border-border rounded animate-pulse" />
                ))}
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-card/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.first_name} {user.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {user.email}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="border border-border p-12 text-center">
                <p className="text-muted-foreground">No users yet</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
