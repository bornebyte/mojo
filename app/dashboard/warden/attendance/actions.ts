"use server"

import { Attendance, AttendanceStats, UserPayload } from "@/lib/types";
import { sql } from "@/lib/db";

const createAttendanceTable = async () => {
    try {
        // Create table if not exists
        await sql`CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            usn_id INTEGER NOT NULL REFERENCES users(id),
            allocated_building VARCHAR(100),
            allocated_floor VARCHAR(50),
            status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'on_leave')),
            reason TEXT,
            marked_by_id INTEGER REFERENCES users(id),
            marked_by_name VARCHAR(255),
            timestamp TIMESTAMP DEFAULT NOW()
        )`;

        // Check if old 'present' column exists and migrate to 'status'
        const checkColumn = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'attendance' AND column_name = 'present'
        `;

        if (checkColumn.length > 0) {
            // Migrate from boolean 'present' to varchar 'status'
            console.log("Migrating attendance table from 'present' column to 'status' column...");

            // Add status column if it doesn't exist
            await sql`
                ALTER TABLE attendance 
                ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'present'
            `;

            // Migrate data: present=true -> status='present', present=false -> status='absent'
            await sql`
                UPDATE attendance 
                SET status = CASE 
                    WHEN present = true THEN 'present'
                    ELSE 'absent'
                END
                WHERE status IS NULL OR status = ''
            `;

            // Add check constraint
            await sql`
                ALTER TABLE attendance 
                DROP CONSTRAINT IF EXISTS attendance_status_check
            `;
            await sql`
                ALTER TABLE attendance 
                ADD CONSTRAINT attendance_status_check 
                CHECK (status IN ('present', 'absent', 'on_leave'))
            `;

            // Drop old column
            await sql`ALTER TABLE attendance DROP COLUMN IF EXISTS present`;

            // Add new columns if they don't exist
            await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS reason TEXT`;
            await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS marked_by_id INTEGER REFERENCES users(id)`;
            await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS marked_by_name VARCHAR(255)`;

            console.log("Migration completed successfully");
        }
    } catch (error) {
        console.error("Failed to create/migrate attendance table:", error);
        return { success: false, message: "Failed to create attendance table. Please check the logs." };
    }
}

export const getAllStudentsForAttendance = async (wardenDetails: UserPayload) => {
    await createAttendanceTable();
    const { assigned_building, assigned_floor } = wardenDetails;

    try {
        const floorNumbers = assigned_floor ? JSON.parse(assigned_floor) : [];
        const floorStrings = floorNumbers.map((floor: number) => String(floor));
        const floorStringsTuple = `('${floorStrings.join("', '")}')`;

        const query = `SELECT * FROM users WHERE allocated_building = '${assigned_building}' AND allocated_floor IN ${floorStringsTuple} AND role = 'student'`;
        const students = await sql.query(query);

        const todayAttendanceQuery = `SELECT * FROM attendance WHERE allocated_building ='${assigned_building}' AND allocated_floor IN ${floorStringsTuple} AND DATE(timestamp) = CURRENT_DATE`;
        const todayAttendance = await sql.query(todayAttendanceQuery);

        const markedStudentIds = new Set(todayAttendance.map((record) => (record as Attendance).usn_id));

        const unmarkedStudents = students.filter((student: UserPayload) => !markedStudentIds.has(student.id || 0));
        return { success: true, data: unmarkedStudents };
    } catch (error) {
        console.error("Failed to fetch students:", error);
        return { success: false, message: "Failed to fetch students. Please check the logs." };
    }
}

export const markAttendance = async (
    studentDetails: UserPayload,
    status: "present" | "absent" | "on_leave",
    wardenDetails: UserPayload,
    reason?: string
) => {
    try {
        await sql`INSERT INTO attendance (
            name, 
            usn_id, 
            allocated_building, 
            allocated_floor, 
            status,
            reason,
            marked_by_id,
            marked_by_name
        ) VALUES (
            ${studentDetails.name}, 
            ${studentDetails.id}, 
            ${studentDetails.allocated_building}, 
            ${studentDetails.allocated_floor}, 
            ${status},
            ${reason || null},
            ${wardenDetails.id},
            ${wardenDetails.name}
        )`;

        const statusText = status === "on_leave" ? "on leave" : status;
        return { success: true, message: `${studentDetails.name} marked as ${statusText}.` };
    } catch (error) {
        console.error("Failed to mark attendance:", error);
        return { success: false, message: "Failed to mark attendance. Please check the logs." };
    }
}

export const getAllStudentsWithAttendance = async (wardenDetails: UserPayload) => {
    await createAttendanceTable();
    const { assigned_building, assigned_floor } = wardenDetails;

    try {
        const floorNumbers = assigned_floor ? JSON.parse(assigned_floor) : [];
        const floorStrings = floorNumbers.map((floor: number) => String(floor));
        const floorStringsTuple = `('${floorStrings.join("', '")}')`;

        const query = `
            SELECT 
                u.*,
                a.status as attendance_status,
                a.timestamp as attendance_time,
                a.reason as attendance_reason
            FROM users u
            LEFT JOIN (
                SELECT DISTINCT ON (usn_id) *
                FROM attendance
                WHERE DATE(timestamp) = CURRENT_DATE
                ORDER BY usn_id, timestamp DESC
            ) a ON u.id = a.usn_id
            WHERE u.allocated_building = '${assigned_building}' 
            AND u.allocated_floor IN ${floorStringsTuple} 
            AND u.role = 'student'
            ORDER BY u.name
        `;

        const students = await sql.query(query);
        return { success: true, data: students };
    } catch (error) {
        console.error("Failed to fetch students with attendance:", error);
        return { success: false, message: "Failed to fetch students with attendance. Please check the logs." };
    }
}

export const getAttendanceStats = async (wardenDetails: UserPayload) => {
    await createAttendanceTable();
    const { assigned_building, assigned_floor } = wardenDetails;

    try {
        const floorNumbers = assigned_floor ? JSON.parse(assigned_floor) : [];
        const floorStrings = floorNumbers.map((floor: number) => String(floor));
        const floorStringsTuple = `('${floorStrings.join("', '")}')`;

        const totalStudentsQuery = `SELECT COUNT(*) as count FROM users WHERE allocated_building = '${assigned_building}' AND allocated_floor IN ${floorStringsTuple} AND role = 'student'`;
        const totalResult = await sql.query(totalStudentsQuery);
        const total_students = parseInt(totalResult[0]?.count || '0');

        const todayAttendanceQuery = `
            SELECT status, COUNT(*) as count 
            FROM attendance 
            WHERE allocated_building = '${assigned_building}' 
            AND allocated_floor IN ${floorStringsTuple}
            AND DATE(timestamp) = CURRENT_DATE
            GROUP BY status
        `;
        const attendanceCounts = await sql.query(todayAttendanceQuery);

        const stats: AttendanceStats = {
            total_students,
            present: 0,
            absent: 0,
            on_leave: 0,
            attendance_rate: 0
        };

        attendanceCounts.forEach((row) => {
            const count = parseInt((row as { status: string; count: string }).count);
            const status = (row as { status: string; count: string }).status;
            if (status === 'present') stats.present = count;
            else if (status === 'absent') stats.absent = count;
            else if (status === 'on_leave') stats.on_leave = count;
        });

        const marked = stats.present + stats.absent + stats.on_leave;
        stats.attendance_rate = total_students > 0 ? (stats.present / total_students) * 100 : 0;

        return { success: true, data: { ...stats, marked, unmarked: total_students - marked } };
    } catch (error) {
        console.error("Failed to fetch attendance stats:", error);
        return { success: false, message: "Failed to fetch attendance stats. Please check the logs." };
    }
}

export const getAttendanceHistory = async (wardenDetails: UserPayload, days: number = 30) => {
    await createAttendanceTable();
    const { assigned_building, assigned_floor } = wardenDetails;

    try {
        const floorNumbers = assigned_floor ? JSON.parse(assigned_floor) : [];
        const floorStrings = floorNumbers.map((floor: number) => String(floor));
        const floorStringsTuple = `('${floorStrings.join("', '")}')`;

        const query = `
            SELECT 
                DATE(timestamp) as date,
                status,
                COUNT(*) as count
            FROM attendance
            WHERE allocated_building = '${assigned_building}'
            AND allocated_floor IN ${floorStringsTuple}
            AND timestamp >= CURRENT_DATE - INTERVAL '${days} days'
            GROUP BY DATE(timestamp), status
            ORDER BY date DESC
        `;

        const history = await sql.query(query);
        return { success: true, data: history };
    } catch (error) {
        console.error("Failed to fetch attendance history:", error);
        return { success: false, message: "Failed to fetch attendance history. Please check the logs." };
    }
}

export const getAllStudents = async (wardenDetails: UserPayload) => {
    const { assigned_building, assigned_floor } = wardenDetails;

    try {
        const floorNumbers = assigned_floor ? JSON.parse(assigned_floor) : [];
        const floorStrings = floorNumbers.map((floor: number) => String(floor));
        const floorStringsTuple = `('${floorStrings.join("', '")}')`;

        const query = `
            SELECT * FROM users 
            WHERE allocated_building = '${assigned_building}' 
            AND allocated_floor IN ${floorStringsTuple} 
            AND role = 'student'
            ORDER BY allocated_floor, allocated_room, name
        `;

        const students = await sql.query(query);
        return { success: true, data: students };
    } catch (error) {
        console.error("Failed to fetch students:", error);
        return { success: false, message: "Failed to fetch students. Please check the logs." };
    }
}

export const addStudent = async (studentData: UserPayload, wardenDetails: UserPayload) => {
    try {
        const result = await sql`
            INSERT INTO users (
                name, 
                email, 
                phone, 
                role, 
                usn_id, 
                allocated_building, 
                allocated_floor, 
                allocated_room,
                added_by_id,
                added_by_name,
                added_by_role,
                status
            ) VALUES (
                ${studentData.name},
                ${studentData.email},
                ${studentData.phone},
                'student',
                ${studentData.usn_id},
                ${studentData.allocated_building},
                ${studentData.allocated_floor},
                ${studentData.allocated_room},
                ${wardenDetails.id},
                ${wardenDetails.name},
                ${wardenDetails.role},
                'active'
            )
            RETURNING *
        `;

        return { success: true, message: "Student added successfully", data: result[0] };
    } catch (error) {
        console.error("Failed to add student:", error);
        return { success: false, message: "Failed to add student. Please check the logs." };
    }
}

export const updateStudent = async (studentId: number, studentData: Partial<UserPayload>) => {
    try {
        const result = await sql`
            UPDATE users 
            SET 
                name = COALESCE(${studentData.name}, name),
                email = COALESCE(${studentData.email}, email),
                phone = COALESCE(${studentData.phone}, phone),
                usn_id = COALESCE(${studentData.usn_id}, usn_id),
                allocated_building = COALESCE(${studentData.allocated_building}, allocated_building),
                allocated_floor = COALESCE(${studentData.allocated_floor}, allocated_floor),
                allocated_room = COALESCE(${studentData.allocated_room}, allocated_room),
                status = COALESCE(${studentData.status}, status)
            WHERE id = ${studentId}
            RETURNING *
        `;

        return { success: true, message: "Student updated successfully", data: result[0] };
    } catch (error) {
        console.error("Failed to update student:", error);
        return { success: false, message: "Failed to update student. Please check the logs." };
    }
}

export const deleteStudent = async (studentId: number) => {
    try {
        await sql`DELETE FROM users WHERE id = ${studentId} AND role = 'student'`;
        return { success: true, message: "Student deleted successfully" };
    } catch (error) {
        console.error("Failed to delete student:", error);
        return { success: false, message: "Failed to delete student. Please check the logs." };
    }
}

// Keep the old function for backward compatibility
export const markPresent = async (studentDetails: UserPayload) => {
    try {
        await sql`INSERT INTO attendance (name, usn_id, allocated_building, allocated_floor, status) 
                  VALUES (${studentDetails.name}, ${studentDetails.id}, ${studentDetails.allocated_building}, ${studentDetails.allocated_floor}, 'present')`;
        return { success: true, message: `${studentDetails.name} marked present.` };
    } catch (error) {
        console.error("Failed to mark student as present:", error);
        return { success: false, message: "Failed to mark student as present. Please check the logs." };
    }
}
