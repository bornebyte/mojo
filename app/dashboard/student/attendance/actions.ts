"use server"

import { sql } from "@/lib/db";

export const getStudentAttendance = async (studentId: number) => {
    try {
        const result = await sql`
            SELECT 
                id,
                status,
                reason,
                marked_by_name,
                timestamp,
                allocated_building,
                allocated_floor
            FROM attendance 
            WHERE usn_id = ${studentId}
            ORDER BY timestamp DESC
        `;

        // Get statistics
        const stats = await sql`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'present') as present_count,
                COUNT(*) FILTER (WHERE status = 'absent') as absent_count,
                COUNT(*) FILTER (WHERE status = 'on_leave') as leave_count,
                COUNT(*) as total_count
            FROM attendance 
            WHERE usn_id = ${studentId}
        `;

        return {
            success: true,
            data: result,
            stats: stats[0] || { present_count: 0, absent_count: 0, leave_count: 0, total_count: 0 }
        };
    } catch (error) {
        console.error("Error fetching student attendance:", error);
        return {
            success: false,
            message: "Failed to fetch attendance data",
            data: [],
            stats: { present_count: 0, absent_count: 0, leave_count: 0, total_count: 0 }
        };
    }
}
