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
} from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"
import { useContext } from "react"
import UserContext from "@/app/context/UserContext"

const NavigationMenuComponent = () => {
  const user = useContext(UserContext)?.user
  const isLoggedIn = !!user

  return (
    <section className="w-full h-14 px-4 flex justify-between items-center">
      <Link href={"/"}>
        <Image src={"/hostel_logo.png"} width={70} height={70} alt="Mojo Logo" priority className="h-full w-auto" />
      </Link>
      <nav className="hidden md:flex items-center justify-center gap-4">
        <Button variant={"outline"} asChild>
          <Link href={"/"}>Home</Link>
        </Button>
        <Button variant={"outline"} asChild>
          <Link href={"/about"}>About</Link>
        </Button>
        {
          user == null ? <Button variant={"outline"} asChild><Link href={"/login"}>Login</Link></Button> :
            <Button variant={"outline"} asChild><Link href={`/dashboard/${user?.role}`}>Dashboard</Link></Button>
        }
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
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href="/">Home</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/about">About</Link>
            </DropdownMenuItem>
            {!isLoggedIn && (
              <DropdownMenuItem asChild>
                <Link href="/login">Login</Link>
              </DropdownMenuItem>
            )}
            {isLoggedIn && (
              <DropdownMenuItem asChild>
                {user && <Link href={`/dashboard/${user?.role}`}>Dashboard</Link>}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  )
}

export default NavigationMenuComponent