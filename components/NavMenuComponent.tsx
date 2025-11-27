"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Menu, LogIn, LayoutDashboard } from "lucide-react"
import { useContext } from "react"
import UserContext from "@/app/context/UserContext"

const NavigationMenuComponent = () => {
  const user = useContext(UserContext)?.user
  const isLoggedIn = !!user

  const getDashboardLink = () => {
    if (!user) return "/login"
    return user.role === "canteen manager"
      ? "/dashboard/canteen-manager"
      : `/dashboard/${user.role}`
  }

  return (
    <section className="w-full h-16 px-4 lg:px-8 flex justify-between items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <Link href={"/"} className="flex items-center gap-2">
        <Image src={"/hostel_logo.png"} width={70} height={70} alt="Mojo Logo" priority className="h-full w-auto" />
        <span className="font-bold text-xl hidden sm:inline-block">Mojo</span>
      </Link>
      <nav className="hidden md:flex items-center justify-center gap-2">
        <Button variant={"ghost"} asChild>
          <Link href={"/"}>Home</Link>
        </Button>
        <Button variant={"ghost"} asChild>
          <Link href={"/#features"}>Features</Link>
        </Button>
        <Button variant={"ghost"} asChild>
          <Link href={"/about"}>About</Link>
        </Button>
        {isLoggedIn ? (
          <Button variant={"default"} asChild>
            <Link href={getDashboardLink()}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        ) : (
          <Button variant={"default"} asChild>
            <Link href={"/login"}>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
        )}
        <ModeToggle />
      </nav>
      <div className="md:hidden flex items-center justify-center gap-2">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">Home</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/#features" className="cursor-pointer">Features</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/about" className="cursor-pointer">About</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isLoggedIn ? (
              <DropdownMenuItem asChild>
                <Link href={getDashboardLink()} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link href="/login" className="cursor-pointer">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  )
}

export default NavigationMenuComponent