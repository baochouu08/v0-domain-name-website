"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border border-border shadow-lg">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-light tracking-tight">Verify Your Email</CardTitle>
            <CardDescription className="text-base">Check your inbox for confirmation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've sent a confirmation link to your email address. Please check your inbox and click the link to verify
              your account.
            </p>
            <p className="text-sm text-muted-foreground">Once verified, you can sign in and start browsing domains.</p>
            <Link href="/auth/login" className="inline-block w-full mt-4">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2">
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
