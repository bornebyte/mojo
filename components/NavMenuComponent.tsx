import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cookies } from "next/headers"
import { JWTPayload, jwtVerify } from "jose"
import { logout } from "@/app/login/action"
import { ModeToggle } from "./theme-toggle"

interface UserPayload extends JWTPayload {
  name?: string;
  usn_id?: string;
  role?: "student" | "warden" | "admin" | "canteen manager";
}

const NavigationMenuComponent = async () => {
  var isLoggedIn = false
  var user: UserPayload = {};
  const cookie = await cookies()
  const token = cookie.get("token")
  if (token) {
    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET)
    )
    isLoggedIn = true
    user = payload
  }
  return (
    <section className="w-full h-14 px-4 flex justify-between items-center">
      <Link href={"/"}>
        <Image src={"/hostel_logo.png"} width={100} height={100} alt="Mojo Logo" priority />
      </Link>
      <nav className="flex items-center justify-center gap-4">
        <Button variant={"outline"} asChild>
          <Link href={"/"}>Home</Link>
        </Button>
        <Button variant={"outline"} asChild>
          <Link href={"/about"}>About</Link>
        </Button>
        {isLoggedIn ?
          <>
            <Button variant={"outline"} asChild>
              <Link href={`/dashboard/${user.role}`}>Dashboard</Link>
            </Button>
            <Button variant={"outline"} onClick={logout} asChild>
              <Link href={"/login"}>Logout</Link>
            </Button>
          </>
          :
          <Button variant={"outline"} asChild>
            <Link href={"/login"}>Login</Link>
          </Button>
        }
        <ModeToggle />
      </nav>
    </section>
  )
}

export default NavigationMenuComponent