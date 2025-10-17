"use server"
import { neon } from "@neondatabase/serverless";
import { AES, enc } from "crypto-js";
import { SignJWT } from 'jose';
import { cookies } from "next/headers";

export async function createUserTable() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(20),
      password VARCHAR(255),
      role VARCHAR(50),
      usn_id VARCHAR(50) UNIQUE,
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
  // const dateInIST = new Date(createdAtUTC).toLocaleString("en-IN", {
  //   timeZone: "Asia/Kolkata"
  // });
  return data;
}

export const createUser = async (name: string, email: string, phone: string, password: string, role: string, usn_id: string) => {
  await createUserTable()
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  const existingusn_id = await sql`SELECT usn_id FROM users WHERE usn_id = ${usn_id}`;
  if (existingusn_id.length > 0) {
    return "User already exists";
  }
  var encryptedPassword = AES.encrypt(password, process.env.SECRET_KEY).toString();
  const result = await sql`
    INSERT INTO users (name, email, phone, password, role, usn_id)
    VALUES (${name}, ${email}, ${phone}, ${encryptedPassword}, ${role}, ${usn_id})
    RETURNING usn_id;
  `;
  return "User created successfully";
}


export const loginUser = async (usn_id: string, password: string, role: string) => {
  await createUserTable()
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  const existingUser = await sql`SELECT * FROM users WHERE usn_id = ${usn_id} AND role = ${role}`;
  if (existingUser.length === 0) {
    return { message: "User does not exist", loginstatus: false };
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
  return { message: "Login successful", loginstatus: true };
}

export const logout = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('token');
  return { message: "Logout successful" };
}
