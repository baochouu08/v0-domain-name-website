"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postal_code: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)

      try {
        const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

        if (error) throw error
        setProfile(profileData)
      } catch (err) {
        console.error("Error loading profile:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value })
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          country: profile.country,
          postal_code: profile.postal_code,
        })
        .eq("id", profile.id)

      if (error) throw error
      alert("Profile updated successfully!")
    } catch (err) {
      console.error("Error saving profile:", err)
      alert("Failed to save profile")
    } finally {
      setIsSaving(false)
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
              <h1 className="text-4xl font-light tracking-tight">Profile</h1>
              <p className="text-muted-foreground mt-2">Manage your account information</p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-card border border-border rounded animate-pulse" />
                ))}
              </div>
            ) : profile ? (
              <Card className="border border-border p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">First Name</Label>
                      <Input
                        value={profile.first_name || ""}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        className="bg-card border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Last Name</Label>
                      <Input
                        value={profile.last_name || ""}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                        className="bg-card border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      value={profile.email || ""}
                      disabled
                      className="bg-card border-border opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input
                      value={profile.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-card border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Address</Label>
                    <Input
                      value={profile.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="bg-card border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">City</Label>
                      <Input
                        value={profile.city || ""}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="bg-card border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Country</Label>
                      <Input
                        value={profile.country || ""}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        className="bg-card border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Postal Code</Label>
                    <Input
                      value={profile.postal_code || ""}
                      onChange={(e) => handleInputChange("postal_code", e.target.value)}
                      className="bg-card border-border"
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2"
                  >
                    {isSaving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="border border-border p-6 text-center">
                <p className="text-muted-foreground">Failed to load profile</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
