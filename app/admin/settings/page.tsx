"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "DomainHub",
    taxRate: "10",
    supportEmail: "support@domainub.com",
  })
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single()

      if (!profile?.is_admin) {
        router.push("/")
      }
    }

    checkAdmin()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings saved successfully!")
    }, 1000)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-8">
          <div className="max-w-2xl">
            <div className="mb-8">
              <h1 className="text-4xl font-light tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-2">Configure your marketplace settings</p>
            </div>

            <Card className="border border-border p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Site Name</Label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="bg-card border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                  className="bg-card border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Support Email</Label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="bg-card border-border"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
