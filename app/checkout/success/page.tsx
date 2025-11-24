"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Home } from "lucide-react"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadReceipt = () => {
    setIsLoading(true)
    // Simulate receipt generation
    setTimeout(() => {
      setIsLoading(false)
      alert("Receipt downloaded successfully!")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-light tracking-tight mb-3">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground">Thank you for your purchase. Your domains are now active.</p>
        </div>

        <Card className="border border-border p-8 mb-8">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-2xl font-light font-mono">{orderId?.slice(0, 8).toUpperCase() || "N/A"}</p>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="font-semibold mb-4">What happens next?</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">1.</span>
                  <span>A confirmation email has been sent to your email address</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">2.</span>
                  <span>Your domain DNS records are now active and ready to use</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">3.</span>
                  <span>You can manage your domains from your account dashboard</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">4.</span>
                  <span>Automatic renewal is enabled for all purchased domains</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-border pt-6 bg-card/50 p-4 rounded">
              <p className="text-sm font-medium mb-3">Support & Resources</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Need help? Check our FAQ or contact support@domainub.com</p>
                <p>DNS configuration guide available in your dashboard</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleDownloadReceipt}
            disabled={isLoading}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">View My Domains</Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
