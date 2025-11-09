"use server"

import { neon } from "@neondatabase/serverless";

export const getAllUsers = async () => {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT id, name, email, phone, role, usn_id, added_by_name, added_by_id, added_by_role, status, allocated_building, allocated_floor, allocated_room, assigned_building, assigned_floor, created_at FROM users ORDER BY created_at DESC`;

    return result;
}

export const getWardenNameByStudentBuildingAndFloor = async (building: string | null, floor: string | null) => {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT name FROM users WHERE role = 'warden' AND allocated_building = ${building} AND allocated_floor = ${floor} LIMIT 1`;
    if (result.length > 0) {
        return result[0].name;
    } else {
        return "N/A";
    }
}
