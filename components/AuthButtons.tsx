"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout as logoutAction } from "@/app/login/action"
import type { UserPayload } from "@/lib/types"

export default function AuthButtons({ isLoggedIn, user }: { isLoggedIn: boolean; user: UserPayload }) {
    const router = useRouter()

    const handleLogout = async () => {
        await logoutAction()
        router.push("/login")
    }

    if (isLoggedIn) {
        return (
            <>
                <Button variant={"outline"} asChild><Link href={`/dashboard/${user.role}`}>Dashboard</Link></Button>
                {/* <Button variant={"outline"} onClick={handleLogout}>Logout</Button> */}
            </>
        )
    }

    return <Button variant={"outline"} asChild><Link href={"/login"}>Login</Link></Button>
}