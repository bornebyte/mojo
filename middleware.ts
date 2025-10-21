import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value;

    if (token && token.length > 0) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            await jwtVerify(token, secret);
        } catch (error) {
            console.error('Token verification failed:', error);
            // If token is invalid, clear it and redirect to login
            cookieStore.delete('token');
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
    if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next();
}
