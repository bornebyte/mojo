"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { UserPayload } from "@/lib/types"

export default function AuthButtons({ isLoggedIn, user }: { isLoggedIn: boolean; user: UserPayload }) {
    if (isLoggedIn) {
        return (
            <>
                <Button variant={"outline"} asChild><Link href={`/dashboard/${user.role}`}>Dashboard</Link></Button>
            </>
        )
    }

    return <Button variant={"outline"} asChild><Link href={"/login"}>Login</Link></Button>
}