"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function CallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange the code for a session
        const code = searchParams.get("code")
        if (!code) {
          router.push("/auth/login")
          return
        }

        // Get the current user (session is already set by supabase)
        const { data } = await supabase.auth.getUser()

        if (data?.user) {
          router.push("/")
        } else {
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("Error in callback:", err)
        router.push("/auth/login")
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
