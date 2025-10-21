import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { ModeToggle } from "@/components/theme-toggle"
import type { UserPayload } from "@/lib/types"
import AuthButtons from "./AuthButtons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"

const NavigationMenuComponent = async () => {
  let isLoggedIn: boolean = false
  let user: UserPayload = {};
  const cookie = await cookies()
  const token = cookie.get("token")
  if (token && token.value) {
    try {
      const { payload } = await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET))
      isLoggedIn = true
      user = payload
    } catch (error) {
      // Token is invalid, treat as not logged in
      console.error("Invalid token:", error)
      isLoggedIn = false
    }
  }
  return (
    <section className="w-full h-14 px-4 flex justify-between items-center">
      <Link href={"/"}>
        <Image src={"/hostel_logo.png"} width={100} height={100} alt="Mojo Logo" priority className="h-full w-auto" />
      </Link>
      <nav className="hidden md:flex items-center justify-center gap-4">
        <Button variant={"outline"} asChild>
          <Link href={"/"}>Home</Link>
        </Button>
        <Button variant={"outline"} asChild>
          <Link href={"/about"}>About</Link>
        </Button>
        <AuthButtons isLoggedIn={isLoggedIn} user={user} />
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
                <Link href={`/dashboard/${user.role}`}>Dashboard</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  )
}

export default NavigationMenuComponent