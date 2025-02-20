import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import SupabaseProvider from "@/components/SupabaseProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Personal Budget Manager",
  description: "Manage your personal budget and bills",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            {children}
            <ThemeToggle />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

