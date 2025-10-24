"use server"
import { neon } from "@neondatabase/serverless";
import { AES } from "crypto-js";

type UserRole = "student" | "warden" | "admin" | "canteen manager";

export async function createUserTable() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);

    // const data = await sql`CREATE TABLE IF NOT EXISTS users (
    //   id SERIAL PRIMARY KEY,
    //   name VARCHAR(255),
    //   email VARCHAR(255) UNIQUE,
    //   phone VARCHAR(20),
    //   password VARCHAR(255),
    //   role VARCHAR(255) DEFAULT 'admin',
    //   usn_id VARCHAR(50) UNIQUE,
    //   added_by_name VARCHAR(255),
    //   added_by_id VARCHAR(50),
    //   added_by_role VARCHAR(255),
    //   status VARCHAR(255) DEFAULT 'inactive',
    //   hold_reason TEXT,
    //   allocated_building VARCHAR(255),  -- The building assigned for accommodation
    //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    // );`;

    await sql`CREATE TABLE IF NOT EXISTS warden_assignments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, floor_id)
    );`;

    await sql`CREATE TABLE IF NOT EXISTS student_allocations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, room_id)
    );`;
    // return data;
    return [];
}


export const createUser = async (name: string, email: string, phone: string, password: string, role: UserRole, usn_id: string | null, added_by_name: string, added_by_id: string, added_by_role: UserRole, allocated_room_id?: number, assigned_floor_ids?: number[]) => {
    await createUserTable();
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    const existingUser = await sql`SELECT email FROM users WHERE email = ${email} OR (usn_id = ${usn_id} AND usn_id IS NOT NULL)`;
    if (existingUser.length > 0) {
        return { message: "User already exists", accountcreated: false };
    }
    if (!process.env.SECRET_KEY) {
        throw new Error("SECRET_KEY is not set");
    }
    const encryptedPassword = AES.encrypt(password, process.env.SECRET_KEY as string).toString();

    const newUser = await sql`
        INSERT INTO users (name, email, phone, password, role, usn_id, added_by_name, added_by_id, added_by_role)
        VALUES (${name}, ${email}, ${phone}, ${encryptedPassword}, ${role}, ${usn_id}, ${added_by_name}, ${added_by_id}, ${added_by_role})
        RETURNING id
    ` as { id: number }[];

    if (role === 'warden' && assigned_floor_ids && assigned_floor_ids.length > 0) {
        const newUserId = newUser[0].id;
        for (const floorId of assigned_floor_ids) {
            await sql`INSERT INTO warden_assignments (user_id, floor_id) VALUES (${newUserId}, ${floorId})`;
        }
    }

    if (role === 'student' && allocated_room_id) {
        const newUserId = newUser[0].id;
        await sql`INSERT INTO student_allocations (user_id, room_id) VALUES (${newUserId}, ${allocated_room_id})`;
    }
    return { message: "Account created successfully", accountcreated: true };
};

export const getAvailableBuildingsAndFloors = async () => {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    const buildings = await sql`SELECT id, name FROM buildings` as { id: number, name: string }[];
    const floors = await sql`SELECT id, building_id, floor_number FROM floors` as { id: number, building_id: number, floor_number: number }[];
    const rooms = await sql`SELECT id, floor_id, name FROM rooms` as { id: number, floor_id: number, name: string }[];
    const assignedWardenFloors = await sql`SELECT floor_id FROM warden_assignments` as { floor_id: number }[];
    const assignedStudentRooms = await sql`SELECT room_id FROM student_allocations` as { room_id: number }[];

    const arr = []
    for (let building of buildings) {
        const buildingFloors = floors.filter((floor) => floor.building_id === building.id).map(floor => {
            const floorRooms = rooms.filter(room => room.floor_id === floor.id);
            return {
                ...floor,
                rooms: floorRooms
            }
        });
        arr.push({
            ...building,
            floors: buildingFloors
        })
    }
    return { buildings: arr, assignedWardenFloors, assignedStudentRooms };
}
