"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Warehouse,
  BarChart3,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const links = [
  { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/inventario", label: "Inventario", icon: Warehouse },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <header className="flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <Link href="/pedidos" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Verbena Vibes logo"
            width={36}
            height={36}
            loading="eager"
            className="rounded-full"
          />
          <span className="text-lg font-bold">Verbena Vibes</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Abrir menu"
          className="rounded-md p-1 hover:bg-sidebar-accent"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="hidden items-center gap-3 px-5 py-5 md:flex">
          <Image
            src="/images/logo.png"
            alt="Verbena Vibes logo"
            width={48}
            height={48}
            loading="eager"
            className="rounded-full"
          />
          <div>
            <h1 className="text-lg font-bold leading-tight">Verbena Vibes</h1>
            <p className="text-xs text-sidebar-foreground/60">
              {"Raspa'o Drink"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 md:py-0">
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border px-6 py-4">
          <p className="text-xs text-sidebar-foreground/40">
            Verbena Vibes v1.0
          </p>
          <p className="text-xs text-sidebar-foreground/30">
            323 7077118
          </p>
        </div>
      </aside>
    </>
  )
}
