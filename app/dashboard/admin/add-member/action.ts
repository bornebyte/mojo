"use server"
import { neon } from "@neondatabase/serverless";
import { AES } from "crypto-js";
import { createUserTable } from "@/app/login/action";

type UserRole = "student" | "warden" | "admin" | "canteen manager";

export const createUser = async (name: string, email: string, phone: string, password: string, role: UserRole, usn_id: string | null, added_by_name: string, added_by_id: string, added_by_role: UserRole) => {
    await createUserTable();
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    const existingUser = await sql`SELECT email FROM users WHERE email = ${email} OR usn_id = ${usn_id}`;
    if (existingUser.length > 0) {
        return { message: "User already exists", accountcreated: false };
    }
    if (!process.env.SECRET_KEY) {
        throw new Error("SECRET_KEY is not set");
    }
    const encryptedPassword = AES.encrypt(password, process.env.SECRET_KEY as string).toString();
    
    await sql`
        INSERT INTO users (name, email, phone, password, role, usn_id, added_by_name, added_by_id, added_by_role)
        VALUES (${name}, ${email}, ${phone}, ${encryptedPassword}, ${role}, ${usn_id}, ${added_by_name}, ${added_by_id}, ${added_by_role})
    `;
    return { message: "Account created successfully", accountcreated: true };
};
