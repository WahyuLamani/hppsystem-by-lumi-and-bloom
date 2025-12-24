"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Factory,
  TrendingUp,
  ClipboardList,
  Users,
  Wheat,
  UtensilsCrossed,
  BookOpen,
  Settings,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"

interface NavItem {
  title: string
  href?: string
  icon: React.ReactNode
  children?: {
    title: string
    href: string
  }[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Master Data",
    icon: <Package className="h-5 w-5" />,
    children: [
      { title: "Supplier", href: "/master/supplier" },
      { title: "Bahan Baku", href: "/master/bahan-baku" },
      { title: "Produk", href: "/master/produk" },
      { title: "Resep", href: "/master/resep" },
    ],
  },
  {
    title: "Transaksi",
    icon: <ShoppingCart className="h-5 w-5" />,
    children: [
      { title: "Pembelian", href: "/transaksi/pembelian" },
      { title: "Produksi", href: "/transaksi/produksi" },
      { title: "Penjualan", href: "/transaksi/penjualan" },
      { title: "Pre-Order", href: "/transaksi/pre-order" },
    ],
  },
  {
    title: "Stok",
    icon: <Factory className="h-5 w-5" />,
    children: [
      { title: "Adjustment", href: "/stok/adjustment" },
      { title: "Movement", href: "/stok/movement" },
    ],
  },
  {
    title: "Laporan",
    icon: <TrendingUp className="h-5 w-5" />,
    children: [
      { title: "HPP", href: "/laporan/hpp" },
      { title: "Profit", href: "/laporan/profit" },
      { title: "Stok", href: "/laporan/stok" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>(["Master Data"])

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <UtensilsCrossed className="h-6 w-6 text-blue-600" />
        <span className="ml-3 text-lg font-semibold text-gray-900">
          Sistem HPP
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              {item.children ? (
                // Menu dengan submenu
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openMenus.includes(item.title) && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Submenu */}
                  {openMenus.includes(item.title) && (
                    <ul className="mt-1 ml-6 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "block px-3 py-2 text-sm rounded-lg transition-colors",
                              pathname === child.href
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Menu tanpa submenu
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span>Pengaturan</span>
        </Link>
      </div>
    </aside>
  )
}