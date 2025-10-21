import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { ModeToggle } from "@/components/theme-toggle"
import type { UserPayload } from "@/lib/types"
import AuthButtons from "./AuthButtons"

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
      <nav className="flex items-center justify-center gap-4">
        <Button variant={"outline"} asChild>
          <Link href={"/"}>Home</Link>
        </Button>
        <Button variant={"outline"} asChild>
          <Link href={"/about"}>About</Link>
        </Button>
        <AuthButtons isLoggedIn={isLoggedIn} user={user} />
        <ModeToggle />
      </nav>
    </section>
  )
}

export default NavigationMenuComponent