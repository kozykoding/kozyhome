"use client"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 rounded-lg bg-black/10 p-1 backdrop-blur-lg dark:bg-white/10">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme("light")}>
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme("system")}>
        <Monitor className="h-4 w-4" />
        <span className="sr-only">System</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme("dark")}>
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark</span>
      </Button>
    </div>
  )
}

