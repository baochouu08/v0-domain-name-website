"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Edit2, Plus } from "lucide-react"

interface Domain {
  id: string
  name: string
  description: string
  price: number
  tld: string
  status: string
}

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    tld: "com",
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
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

      setIsAdmin(true)

      try {
        const { data: domainsData, error } = await supabase.from("domains").select("*").order("name")

        if (error) throw error
        setDomains(domainsData || [])
      } catch (err) {
        console.error("Error loading domains:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        const { error } = await supabase
          .from("domains")
          .update({
            name: formData.name,
            description: formData.description,
            price: Number.parseFloat(formData.price),
            tld: formData.tld,
          })
          .eq("id", editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("domains").insert({
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          tld: formData.tld,
          status: "available",
        })

        if (error) throw error
      }

      setFormData({ name: "", description: "", price: "", tld: "com" })
      setEditingId(null)
      setShowForm(false)

      // Reload domains
      const { data: domainsData } = await supabase.from("domains").select("*").order("name")
      setDomains(domainsData || [])
    } catch (err) {
      console.error("Error saving domain:", err)
      alert("Failed to save domain")
    }
  }

  const handleDeleteDomain = async (id: string) => {
    if (!confirm("Are you sure?")) return

    try {
      const { error } = await supabase.from("domains").delete().eq("id", id)

      if (error) throw error

      setDomains(domains.filter((d) => d.id !== id))
    } catch (err) {
      console.error("Error deleting domain:", err)
      alert("Failed to delete domain")
    }
  }

  const handleEditDomain = (domain: Domain) => {
    setFormData({
      name: domain.name,
      description: domain.description,
      price: domain.price.toString(),
      tld: domain.tld,
    })
    setEditingId(domain.id)
    setShowForm(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-light tracking-tight">Domains</h1>
                <p className="text-muted-foreground mt-2">Manage your domain inventory</p>
              </div>
              <Button
                onClick={() => {
                  setShowForm(!showForm)
                  if (showForm) setEditingId(null)
                  setFormData({ name: "", description: "", price: "", tld: "com" })
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Domain
              </Button>
            </div>

            {showForm && (
              <Card className="border border-border p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Domain" : "Add New Domain"}</h2>
                <form onSubmit={handleAddDomain} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Domain Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="example"
                        required
                        className="bg-card border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">TLD</Label>
                      <select
                        value={formData.tld}
                        onChange={(e) => setFormData({ ...formData, tld: e.target.value })}
                        className="w-full px-3 py-2 bg-card border border-border rounded"
                      >
                        <option value="com">com</option>
                        <option value="net">net</option>
                        <option value="org">org</option>
                        <option value="io">io</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Domain description..."
                      className="bg-card border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Price (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="49.99"
                      required
                      className="bg-card border-border"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      {editingId ? "Update Domain" : "Add Domain"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(null)
                        setFormData({
                          name: "",
                          description: "",
                          price: "",
                          tld: "com",
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-card border border-border rounded animate-pulse" />
                ))}
              </div>
            ) : domains.length > 0 ? (
              <div className="space-y-3">
                {domains.map((domain) => (
                  <Card
                    key={domain.id}
                    className="border border-border p-4 flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">
                        {domain.name}.{domain.tld}
                      </h3>
                      <p className="text-sm text-muted-foreground">${domain.price.toFixed(2)}/year</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEditDomain(domain)} variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteDomain(domain.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-border p-12 text-center">
                <p className="text-muted-foreground">No domains yet</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
