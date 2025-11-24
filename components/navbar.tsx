"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ShoppingCart, LogOut, User, Globe } from "lucide-react"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user)

      if (data?.user) {
        const { count } = await supabase.from("cart_items").select("*", { count: "exact" }).eq("user_id", data.user.id)
        setCartCount(count || 0)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser()
    })

    return () => subscription?.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 font-bold text-base sm:text-xl group flex-shrink-0"
          >
            <div className="p-1 sm:p-1.5 bg-gradient-to-br from-primary to-secondary rounded-lg group-hover:shadow-lg transition-all duration-200">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-foreground hidden sm:inline">Domain</span>
            <span className="text-primary hidden sm:inline">Hub</span>
            <span className="text-foreground sm:hidden">Hub</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="relative h-9 sm:h-10 px-2 sm:px-3">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="h-9 sm:h-10 px-2 sm:px-3">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="h-9 sm:h-10 px-2 sm:px-3">
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hidden xs:block">
                  <Button variant="ghost" size="sm" className="h-9 sm:h-10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 sm:h-10 text-xs sm:text-sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
