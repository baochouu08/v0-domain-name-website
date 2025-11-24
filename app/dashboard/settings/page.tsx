"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)
      setIsLoading(false)
    }

    checkUser()
  }, [])

  const handleChangePassword = async () => {
    const newPassword = prompt("Enter your new password:")
    if (!newPassword) return

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      alert("Password updated successfully!")
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update password")
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone. All your data will be deleted.")) {
      return
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) throw error

      await supabase.auth.signOut()
      router.push("/")
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete account")
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-8">
          <div className="max-w-2xl">
            <div className="mb-8">
              <h1 className="text-4xl font-light tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-2">Manage your account security</p>
            </div>

            {!isLoading && (
              <div className="space-y-6">
                <Card className="border border-border p-6">
                  <h2 className="text-lg font-semibold mb-4">Account Security</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Change your password to keep your account secure.
                  </p>
                  <Button onClick={handleChangePassword} variant="outline" className="w-full bg-transparent">
                    Change Password
                  </Button>
                </Card>

                <Card className="border border-destructive bg-destructive/5 p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold mb-2">Danger Zone</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data.
                      </p>
                      <Button
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
