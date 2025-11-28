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

export const updateUserStatus = async (userId: number, status: string) => {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        await sql`UPDATE users SET status = ${status} WHERE id = ${userId}`;
        return { success: true };
    } catch (error) {
        console.error("Error updating user status:", error);
        return { success: false, error: "Failed to update user status" };
    }
}

export const updateUser = async (userId: number, userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    usn_id: string;
    allocated_building: string;
    allocated_floor: string;
    allocated_room: string;
    assigned_building: string;
    assigned_floor: string;
}) => {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        await sql`
            UPDATE users SET 
                name = ${userData.name},
                email = ${userData.email},
                phone = ${userData.phone},
                role = ${userData.role},
                status = ${userData.status},
                usn_id = ${userData.usn_id || null},
                allocated_building = ${userData.allocated_building || null},
                allocated_floor = ${userData.allocated_floor || null},
                allocated_room = ${userData.allocated_room || null},
                assigned_building = ${userData.assigned_building || null},
                assigned_floor = ${userData.assigned_floor || null}
            WHERE id = ${userId}
        `;
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Failed to update user" };
    }
}

export const deleteUser = async (userId: number) => {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        await sql`DELETE FROM users WHERE id = ${userId}`;
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
