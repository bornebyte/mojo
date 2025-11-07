"use server";

import { UserPayload } from "@/lib/types";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export const getUserFromTokenCookie = async (): Promise<UserPayload | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token || !process.env.JWT_SECRET) {
        return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as UserPayload;
};
