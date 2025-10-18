"use server"
import { neon } from "@neondatabase/serverless";
import { AES } from "crypto-js";

export async function createAdminTable() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    await sql`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_admins_status') THEN
                CREATE TYPE enum_admins_status AS ENUM ('active', 'inactive', 'hold', 'deleted');
            END IF;
        END
        $$;
        `;

    const data = await sql`CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(20),
      password VARCHAR(255),
      role VARCHAR(50) DEFAULT 'admin',
      added_by_name VARCHAR(255),
      added_by_id VARCHAR(50),
      status enum_admins_status DEFAULT 'inactive',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    return data;
}

export const createAdmin = async (name: string, email: string, phone: string, password: string, added_by_name: string, added_by_id: string) => {
    await createAdminTable()
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    const existingusn_id = await sql`SELECT email FROM admins WHERE email = ${email}`;
    if (existingusn_id.length > 0) {
        return { message: "User already exists", accountcreated: false };
    }
    var encryptedPassword = AES.encrypt(password, process.env.SECRET_KEY).toString();
    const result = await sql`
    INSERT INTO admins (name, email, phone, password, added_by_name, added_by_id)
    VALUES (${name}, ${email}, ${phone}, ${encryptedPassword}, ${added_by_name}, ${added_by_id})
    RETURNING email;
  `;
    return { message: "User created successfully", accountcreated: true };
}

