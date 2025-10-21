import { UserPayload } from "@/lib/types"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

export const getUserFromToken = async () => {
    const cookiestore = await cookies()
    const token = cookiestore.get("token")?.value
    if (!token) {
        throw new Error("No token found")
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    const user = payload as UserPayload
    return user
}