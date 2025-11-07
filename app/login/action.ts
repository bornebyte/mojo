"use server"
import { neon } from "@neondatabase/serverless";
import { AES, enc } from "crypto-js";
import { SignJWT } from 'jose';
import { cookies } from "next/headers";
import { createUserTable } from "@/app/dashboard/admin/add-member/action";

export const loginUser = async (usn_id: string, password: string, role: string) => {
  await createUserTable();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  const existingUser = await sql`SELECT * FROM users WHERE usn_id = ${usn_id} AND role = ${role}`;
  if (existingUser.length === 0) {
    return { message: "User does not exist", loginstatus: false };
  }
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is not set");
  }
  const decryptedPassword = AES.decrypt(existingUser[0].password, process.env.SECRET_KEY).toString(enc.Utf8);
  if (decryptedPassword !== password && existingUser[0].role == role) {
    return { message: "Incorrect password", loginstatus: false };
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const payload = {
    usn_id: existingUser[0].usn_id,
    name: existingUser[0].name,
    role: existingUser[0].role,
  }
  const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2d') // Token expiration time
    .sign(secret);
  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
  });
  return { message: "Login successful", loginstatus: true, user: existingUser[0] };
}

export const logout = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('token');
  return { message: "Logout successful" };
}
