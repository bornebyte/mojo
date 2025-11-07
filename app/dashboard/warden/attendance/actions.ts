"use server"

import { UserPayload } from "@/lib/types";
import { neon } from "@neondatabase/serverless";

const createAttendanceTable = async () => {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        await sql`CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            usn_id INTEGER NOT NULL REFERENCES users(id),
            allocated_building VARCHAR(100),
            allocated_floor INTEGER,
            present BOOLEAN DEFAULT FALSE,
            timestamp TIMESTAMP DEFAULT NOW()
        )`;
    } catch (error) {
        console.error("Failed to create attendance record:", error);
        return { success: false, message: "Failed to create attendance record. Please check the logs." };
    }
}

export const getAllStudentsForAttendance = async (wardenDetails: UserPayload) => {
    await createAttendanceTable();
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
        const presentedStudentsQuery = `SELECT * FROM attendance WHERE present = TRUE AND allocated_building ='${assigned_building}' AND allocated_floor IN ${floorStringsTuple} AND DATE(timestamp) = CURRENT_DATE`;
        const presentedStudents = await sql.query(presentedStudentsQuery);

        const presentStudentIds = new Set(presentedStudents.map(student => student.usn_id));

        // Filter the main students list to get only those who are not present.
        const absentStudents = students.filter(student => !presentStudentIds.has(student.id));
        return { success: true, data: absentStudents };
    } catch (error) {
        console.error("Failed to fetch students:", error);
        return { success: false, message: "Failed to fetch students. Please check the logs." };
    }
}

export const markPresent = async (studentDetails: UserPayload) => {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        await sql`INSERT INTO attendance (name, usn_id, allocated_building, allocated_floor, present) 
                  VALUES (${studentDetails.name}, ${studentDetails.id}, ${studentDetails.allocated_building}, ${studentDetails.allocated_floor}, TRUE)`;
        return { success: true, message: `${studentDetails.name} marked present.` };
    } catch (error) {
        console.error("Failed to mark student as present:", error);
        return { success: false, message: "Failed to mark student as present. Please check the logs." };
    }
}
