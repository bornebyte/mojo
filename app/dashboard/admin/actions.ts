"use server"

import { sql } from "@/lib/db";
import { Announcement } from "@/lib/types";
import { unstable_cache } from 'next/cache';

// Cache duration in seconds
const CACHE_DURATION = 60; // 1 minute

// Get comprehensive admin statistics with caching
export const getAdminDashboardStats = unstable_cache(
    async () => {
        try {
            // Users stats
            const totalUsers = await sql`SELECT COUNT(*) as count FROM users`;
            const students = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`;
            const wardens = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'warden'`;
            const canteenManagers = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'canteen manager'`;
            const admins = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`;

            // Buildings stats
            const totalBuildings = await sql`SELECT COUNT(*) as count FROM buildings`;
            const totalFloors = await sql`SELECT COUNT(*) as count FROM floors`;
            const totalRooms = await sql`SELECT COUNT(*) as count FROM rooms`;
            const occupiedBeds = await sql`SELECT SUM(beds_occupied) as sum FROM rooms`;
            const totalBeds = await sql`SELECT SUM(bed_count) as sum FROM rooms`;

            // Attendance stats (today)
            const todayAttendance = await sql`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                    SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                    SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) as on_leave
                FROM attendance 
                WHERE DATE(timestamp) = CURRENT_DATE
            `;

            // Feedback stats
            const totalFeedback = await sql`SELECT COUNT(*) as count FROM feedback`;
            const pendingFeedback = await sql`SELECT COUNT(*) as count FROM feedback WHERE status = 'pending'`;
            const avgRating = await sql`SELECT AVG(rating) as avg FROM feedback WHERE rating IS NOT NULL`;

            // Menu stats
            const totalMenus = await sql`SELECT COUNT(*) as count FROM menus`;
            const todayMenus = await sql`SELECT COUNT(*) as count FROM menus WHERE date = CURRENT_DATE`;

            // Announcements stats
            const totalAnnouncements = await sql`SELECT COUNT(*) as count FROM announcements`;
            const activeAnnouncements = await sql`SELECT COUNT(*) as count FROM announcements WHERE active = true`;

            return {
                success: true,
                data: {
                    users: {
                        total: parseInt(totalUsers[0].count),
                        students: parseInt(students[0].count),
                        wardens: parseInt(wardens[0].count),
                        canteenManagers: parseInt(canteenManagers[0].count),
                        admins: parseInt(admins[0].count)
                    },
                    infrastructure: {
                        buildings: parseInt(totalBuildings[0].count),
                        floors: parseInt(totalFloors[0].count),
                        rooms: parseInt(totalRooms[0].count),
                        occupiedBeds: parseInt(occupiedBeds[0]?.sum || 0),
                        totalBeds: parseInt(totalBeds[0]?.sum || 0),
                        occupancyRate: totalBeds[0]?.sum ? ((parseInt(occupiedBeds[0]?.sum || 0) / parseInt(totalBeds[0]?.sum)) * 100).toFixed(1) : '0'
                    },
                    attendance: {
                        total: parseInt(todayAttendance[0]?.total || 0),
                        present: parseInt(todayAttendance[0]?.present || 0),
                        absent: parseInt(todayAttendance[0]?.absent || 0),
                        on_leave: parseInt(todayAttendance[0]?.on_leave || 0),
                        attendanceRate: todayAttendance[0]?.total ? ((parseInt(todayAttendance[0]?.present || 0) / parseInt(todayAttendance[0]?.total)) * 100).toFixed(1) : '0'
                    },
                    feedback: {
                        total: parseInt(totalFeedback[0].count),
                        pending: parseInt(pendingFeedback[0].count),
                        averageRating: avgRating[0].avg ? parseFloat(avgRating[0].avg).toFixed(1) : '0'
                    },
                    menus: {
                        total: parseInt(totalMenus[0].count),
                        today: parseInt(todayMenus[0].count)
                    },
                    announcements: {
                        total: parseInt(totalAnnouncements[0].count),
                        active: parseInt(activeAnnouncements[0].count)
                    }
                }
            };
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            return { success: false, message: "Failed to fetch admin statistics" };
        }
    },
    ['admin-dashboard-stats'],
    {
        revalidate: CACHE_DURATION,
        tags: ['admin-stats']
    }
);

// Get attendance trends for all buildings
export const getAttendanceTrends = async (days: number = 7) => {
    try {
        const result = await sql`
            SELECT 
                DATE(timestamp) as date,
                status,
                COUNT(*)::INTEGER as count
            FROM attendance 
            WHERE timestamp >= CURRENT_DATE - INTERVAL '1 day' * ${days}
            GROUP BY DATE(timestamp), status
            ORDER BY date DESC
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching attendance trends:", error);
        return { success: false, message: "Failed to fetch attendance trends", data: [] };
    }
};

// Get building-wise attendance
export const getBuildingWiseAttendance = async () => {
    try {
        const result = await sql`
            SELECT 
                allocated_building as building,
                allocated_floor as floor,
                status,
                COUNT(*) as count
            FROM attendance 
            WHERE DATE(timestamp) = CURRENT_DATE
            GROUP BY allocated_building, allocated_floor, status
            ORDER BY allocated_building, allocated_floor
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching building-wise attendance:", error);
        return { success: false, message: "Failed to fetch building-wise attendance" };
    }
};

// Get feedback by category with stats
export const getFeedbackCategoryStats = async () => {
    try {
        const result = await sql`
            SELECT 
                category,
                COUNT(*) as count,
                AVG(rating) as avg_rating,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
            FROM feedback
            GROUP BY category
            ORDER BY count DESC
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching feedback category stats:", error);
        return { success: false, message: "Failed to fetch feedback category stats" };
    }
};

// Get recent activities
export const getRecentActivities = async (limit: number = 10) => {
    try {
        const users = await sql`
            SELECT 'user' as type, name, role, created_at as timestamp
            FROM users 
            ORDER BY created_at DESC 
            LIMIT ${limit}
        `;

        const feedback = await sql`
            SELECT 'feedback' as type, subject as name, category as role, created_at as timestamp
            FROM feedback 
            ORDER BY created_at DESC 
            LIMIT ${limit}
        `;

        const announcements = await sql`
            SELECT 'announcement' as type, title as name, category as role, created_at as timestamp
            FROM announcements 
            ORDER BY created_at DESC 
            LIMIT ${limit}
        `;

        const combined = [...users, ...feedback, ...announcements]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);

        return { success: true, data: combined };
    } catch (error) {
        console.error("Error fetching recent activities:", error);
        return { success: false, message: "Failed to fetch recent activities" };
    }
};

// Get warden performance stats
export const getWardenPerformance = async () => {
    try {
        const result = await sql`
            SELECT 
                u.id,
                u.name,
                u.assigned_building,
                u.assigned_floor,
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT CASE WHEN DATE(a.timestamp) = CURRENT_DATE THEN a.id END) as marked_today,
                COUNT(DISTINCT a.id) as total_attendance_marked
            FROM users u
            LEFT JOIN users s ON u.assigned_building = s.allocated_building 
                AND s.allocated_floor = ANY(string_to_array(REPLACE(REPLACE(u.assigned_floor, '[', ''), ']', ''), ',')::text[])
                AND s.role = 'student'
            LEFT JOIN attendance a ON s.id = a.usn_id
            WHERE u.role = 'warden'
            GROUP BY u.id, u.name, u.assigned_building, u.assigned_floor
            ORDER BY total_students DESC
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching warden performance:", error);
        return { success: false, message: "Failed to fetch warden performance" };
    }
};

// Create admin announcement
export const createAdminAnnouncement = async (data: Announcement) => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS announcements (
            id SERIAL PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            message TEXT NOT NULL,
            category VARCHAR(50) NOT NULL,
            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
            target_audience VARCHAR(50) NOT NULL DEFAULT 'all',
            active BOOLEAN DEFAULT true,
            expires_at TIMESTAMP,
            created_by_id INTEGER NOT NULL,
            created_by_name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        const res = await sql`
            INSERT INTO announcements 
            (title, message, category, priority, target_audience, active, expires_at, created_by_id, created_by_name) 
            VALUES 
            (${data.title}, ${data.message}, ${data.category}, ${data.priority}, ${data.target_audience}, ${data.active}, ${data.expires_at || null}, ${data.created_by_id}, ${data.created_by_name}) 
            RETURNING *
        `;

        if (res.length > 0) {
            return { success: true, message: "Announcement created successfully", data: res[0] };
        }
        return { success: false, message: "Failed to create announcement" };
    } catch (error) {
        console.error("Error creating announcement:", error);
        return { success: false, message: "Failed to create announcement" };
    }
};

// Get all announcements
export const getAllAdminAnnouncements = async () => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS announcements (
            id SERIAL PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            message TEXT NOT NULL,
            category VARCHAR(50) NOT NULL,
            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
            target_audience VARCHAR(50) NOT NULL DEFAULT 'all',
            active BOOLEAN DEFAULT true,
            expires_at TIMESTAMP,
            created_by_id INTEGER NOT NULL,
            created_by_name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        const res = await sql`SELECT * FROM announcements ORDER BY created_at DESC`;
        return { success: true, data: res };
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return { success: false, message: "Failed to fetch announcements" };
    }
};

// Delete announcement
export const deleteAdminAnnouncement = async (id: number) => {
    try {
        const res = await sql`DELETE FROM announcements WHERE id = ${id} RETURNING *`;
        if (res.length > 0) {
            return { success: true, message: "Announcement deleted successfully" };
        }
        return { success: false, message: "Announcement not found" };
    } catch (error) {
        console.error("Error deleting announcement:", error);
        return { success: false, message: "Failed to delete announcement" };
    }
};

// Toggle announcement status
export const toggleAdminAnnouncementStatus = async (id: number) => {
    try {
        const res = await sql`
            UPDATE announcements 
            SET active = NOT active, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id} 
            RETURNING *
        `;

        if (res.length > 0) {
            return { success: true, message: "Announcement status updated", data: res[0] };
        }
        return { success: false, message: "Announcement not found" };
    } catch (error) {
        console.error("Error toggling announcement:", error);
        return { success: false, message: "Failed to update announcement" };
    }
};

// Get violations statistics for dashboard
export const getViolationsDashboardStats = async (days: number = 30) => {
    try {
        // Ensure violations table exists
        await sql`CREATE TABLE IF NOT EXISTS violations (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL REFERENCES users(id),
            violation_type VARCHAR(50) NOT NULL,
            severity VARCHAR(20) NOT NULL,
            title VARCHAR(500) NOT NULL,
            description TEXT,
            location VARCHAR(200),
            damage_cost DECIMAL(10, 2),
            evidence_photo_url TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            action_taken TEXT,
            fine_amount DECIMAL(10, 2),
            fine_paid BOOLEAN DEFAULT false,
            reported_by INTEGER NOT NULL REFERENCES users(id),
            reviewed_by INTEGER REFERENCES users(id),
            incident_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP
        )`;

        // Get total counts by severity
        const severityCounts = await sql`
            SELECT 
                severity,
                COUNT(*)::INTEGER as count
            FROM violations
            WHERE incident_date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
            GROUP BY severity
        `;

        // Get total counts by status
        const statusCounts = await sql`
            SELECT 
                status,
                COUNT(*)::INTEGER as count
            FROM violations
            WHERE incident_date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
            GROUP BY status
        `;

        // Get daily violation trends
        const dailyTrends = await sql`
            SELECT 
                DATE(incident_date) as date,
                COUNT(*)::INTEGER as count,
                SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END)::INTEGER as critical_count
            FROM violations
            WHERE incident_date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
            GROUP BY DATE(incident_date)
            ORDER BY date DESC
        `;

        // Get fine statistics
        const fineStats = await sql`
            SELECT 
                COALESCE(SUM(fine_amount), 0)::DECIMAL as total_fines,
                COALESCE(SUM(CASE WHEN fine_paid THEN fine_amount ELSE 0 END), 0)::DECIMAL as collected_fines,
                COUNT(CASE WHEN fine_amount > 0 AND NOT fine_paid THEN 1 END)::INTEGER as pending_fines_count
            FROM violations
            WHERE incident_date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
        `;

        // Get violation types breakdown
        const typeBreakdown = await sql`
            SELECT 
                violation_type,
                COUNT(*)::INTEGER as count
            FROM violations
            WHERE incident_date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
            GROUP BY violation_type
            ORDER BY count DESC
        `;

        return {
            success: true,
            data: {
                severityCounts,
                statusCounts,
                dailyTrends,
                fineStats: fineStats[0] || { total_fines: 0, collected_fines: 0, pending_fines_count: 0 },
                typeBreakdown
            }
        };
    } catch (error) {
        console.error("Error fetching violations dashboard stats:", error);
        return {
            success: false,
            message: "Failed to fetch violations stats",
            data: {
                severityCounts: [],
                statusCounts: [],
                dailyTrends: [],
                fineStats: { total_fines: 0, collected_fines: 0, pending_fines_count: 0 },
                typeBreakdown: []
            }
        };
    }
};
