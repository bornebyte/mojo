"use server"
import { sql } from "@/lib/db";
import { AES, enc } from "crypto-js";
import { SignJWT } from 'jose';
import { cookies } from "next/headers";
import { createUserTable } from "@/app/dashboard/admin/add-member/action";

export const loginUser = async (usn_id: string, password: string, role: string) => {
  try {
    await createUserTable();

    if (!process.env.SECRET_KEY) {
      throw new Error("SECRET_KEY is not set");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }

    const existingUser = await sql`SELECT * FROM users WHERE usn_id = ${usn_id} AND role = ${role}`;

    if (existingUser.length === 0) {
      return { message: "User does not exist", loginstatus: false };
    }

    const decryptedPassword = AES.decrypt(existingUser[0].password, process.env.SECRET_KEY).toString(enc.Utf8);

    if (decryptedPassword !== password && existingUser[0].role == role) {
      return { message: "Incorrect password", loginstatus: false };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const token = await new SignJWT(existingUser[0])
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d') // Token expiration time
      .sign(secret);

    const cookieStore = await cookies()
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
    });

    return { message: "Login successful", loginstatus: true, user: existingUser[0] };
  } catch (error) {
    console.error("Login error:", error);
    return {
      message: error instanceof Error ? error.message : "An error occurred during login",
      loginstatus: false
    };
  }
}

export const logout = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('token');
  return { message: "Logout successful" };
}
