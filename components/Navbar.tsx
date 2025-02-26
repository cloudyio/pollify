"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

import { Menu, X, ChevronDown, PlusSquare, BarChart2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { name: "Home", href: "/" },
  { name: "My Polls", href: "/user-polls" },
]

export default function Navbar() { 
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user || null

  return (
    <div>
      <nav className="bg-background shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary">
                  Pollify
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {Array.isArray(navItems) && navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === item.href
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link href="/quick-poll" passHref>
                <Button variant="ghost" size="icon" className="mr-4">
                  <PlusSquare className="h-5 w-5" />
                  <span className="sr-only">Create Poll</span>
                </Button>
              </Link>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      <span>{user.name}</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => signOut() }>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className={`${isOpen ? "block" : "hidden"} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {Array.isArray(navItems) && navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === item.href
                    ? "border-primary text-primary bg-primary/10"
                    : "border-transparent text-muted-foreground hover:bg-gray-50 hover:border-gray-300 hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <User className="h-10 w-10 rounded-full bg-gray-300 p-2" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-foreground">{user ? user.name : "Guest"}</div>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <PlusSquare className="h-6 w-6" />
                <span className="sr-only">Create Poll</span>
              </Button>
            </div>
            <div className="mt-3 space-y-1">
              {user ? (
                <button className="block w-full text-left px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100" onClick={() => signOut()}>
                  Log out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

