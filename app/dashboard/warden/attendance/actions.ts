"use server"

import { BuildingAllUsers, UserPayload } from "@/lib/types";
import { neon } from "@neondatabase/serverless";

export const getWardenAllDetails = async (user: UserPayload) => {
    const sql = neon(process.env.DATABASE_URL!);

    try {
        const wardenDetails = await sql`SELECT * FROM users WHERE usn_id = ${user.usn_id}`;
        return { success: true, data: wardenDetails[0] };
    } catch (error) {
        console.error("Failed to fetch warden details:", error);
        return { success: false, message: "Failed to fetch warden details. Please check the logs." };
    }
}

export const getAllStudentsInBuildingAndFloor = async (wardenDetails: BuildingAllUsers) => {
    const sql = neon(process.env.DATABASE_URL!);
    const { assigned_building, assigned_floor } = wardenDetails; // assigned_floor is a string like '[4,5,6]'

    try {
        // 1. Parse the JSON string into an array of numbers.
        const floorNumbers = assigned_floor ? JSON.parse(assigned_floor) : [];

        // 2. Convert each number to a string to match the VARCHAR column type.
        const floorStrings = floorNumbers.map((floor: number) => String(floor));
        const floorStringsTuple = `('${floorStrings.join("', '")}')`

        // 3. Use the array of strings directly in the query. `neon` will handle formatting.
        const query = `SELECT * FROM users WHERE allocated_building = '${assigned_building}' AND allocated_floor IN ${floorStringsTuple} AND role = 'student'`
        const students = await sql.query(query);
        return { success: true, data: students };
    } catch (error) {
        console.error("Failed to fetch students:", error);
        return { success: false, message: "Failed to fetch students. Please check the logs." };
    }
}

export const getAllStudentsInBuildingAndFloorByDate = async (wardenDetails: BuildingAllUsers) => {
    const sql = neon(process.env.DATABASE_URL!);
    const { assigned_building, assigned_floor } = wardenDetails; // assigned_floor is a string like '[4,5,6]'

    try {
        // 1. Parse the JSON string into an array of numbers.
        const floorNumbers = assigned_floor ? JSON.parse(assigned_floor) : [];

        // 2. Convert each number to a string to match the VARCHAR column type.
        const floorStrings = floorNumbers.map((floor: number) => String(floor));
        const floorStringsTuple = `('${floorStrings.join("', '")}')`

        // 3. Use the array of strings directly in the query. `neon` will handle formatting.
        const query = `SELECT * FROM attendance WHERE building='${assigned_building}' AND floor IN ${floorStringsTuple} AND DATE(timestamp) = CURRENT_DATE AND present = FALSE`
        // console.log(query)
        const students = await sql.query(query);
        return { success: true, data: students };
    } catch (error) {
        console.error("Failed to fetch students:", error);
        return { success: false, message: "Failed to fetch students. Please check the logs." };
    }
}

const createAttendanceTable = async () => {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        await sql`CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            user_id INTEGER NOT NULL REFERENCES users(id),
            building VARCHAR(100),
            floor INTEGER,
            present BOOLEAN DEFAULT FALSE,
            timestamp TIMESTAMP DEFAULT NOW()
        )`;
    } catch (error) {
        console.error("Failed to create attendance record:", error);
        return { success: false, message: "Failed to create attendance record. Please check the logs." };
    }
}

export const insertIfTodayAttendanceNotExists = async (user: UserPayload) => {
    await createAttendanceTable();
    const wardenDetailsRes = await getWardenAllDetails(user);
    if (!wardenDetailsRes.success) {
        return { success: false, message: "Failed to get warden details." };
    }
    const wardenDetails = wardenDetailsRes.data;
    const studentsRes = await getAllStudentsInBuildingAndFloor(wardenDetails as BuildingAllUsers);
    const sql = neon(process.env.DATABASE_URL!);
    try {
        const res = await sql`SELECT * FROM attendance WHERE DATE(timestamp) = CURRENT_DATE`;
        if (res.length > 0) {
            return { success: true, message: "Attendance records already exist for today." };
        } else {
            if (studentsRes.data && Array.isArray(studentsRes.data)) {
                for (let student of studentsRes.data) {
                    await sql`INSERT INTO attendance (name, user_id, building, floor) VALUES (${student.name}, ${student.id}, ${student.allocated_building}, ${student.allocated_floor})`
                }
                return { success: true, message: "Attendance records created for today." };
            } else {
                return { success: false, message: "No student data available to create attendance records." };
            }
        }
    } catch (error) {
        console.error("Failed to check or insert attendance:", error);
        return { success: false, message: "Failed to check or insert attendance. Please check the logs." };
    }
}

export const markPresent = async (student: BuildingAllUsers) => {
    await createAttendanceTable();
    const sql = neon(process.env.DATABASE_URL!);
    try {
        const query = `UPDATE attendance SET present=TRUE WHERE user_id='${student.user_id}' AND DATE(timestamp)=CURRENT_DATE RETURNING *;`;
        const res = await sql.query(query);
        return { success: true, id: res[0].id, message: "Marked Present" }
    } catch (error) {
        console.error("Failed to mark present:", error);
        return { success: false, message: "Failed to mark present. Please check the logs.", data: [] };
    }
}
