"use server"

import { sql } from "@/lib/db";
import { Feedback } from "@/lib/types";
import { unstable_cache } from 'next/cache';

// Get student's attendance records
export const getStudentAttendance = async (studentId: number, days: number = 30) => {
    try {
        const result = await sql`
            SELECT 
                DATE(timestamp) as date,
                status,
                reason,
                marked_by_name,
                timestamp
            FROM attendance 
            WHERE usn_id = ${studentId}
            AND DATE(timestamp) >= CURRENT_DATE - ${days}
            ORDER BY timestamp DESC
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching student attendance:", error);
        return { success: false, message: "Failed to fetch attendance records" };
    }
};

// Get student's attendance statistics
export const getStudentAttendanceStats = async (studentId: number) => {
    try {
        // Overall stats
        const overall = await sql`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) as on_leave
            FROM attendance 
            WHERE usn_id = ${studentId}
        `;

        // This month stats
        const thisMonth = await sql`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) as on_leave
            FROM attendance 
            WHERE usn_id = ${studentId}
            AND DATE(timestamp) >= DATE_TRUNC('month', CURRENT_DATE)
        `;

        // Last 7 days trend
        const weekTrend = await sql`
            SELECT 
                DATE(timestamp) as date,
                status,
                COUNT(*) as count
            FROM attendance 
            WHERE usn_id = ${studentId}
            AND DATE(timestamp) >= CURRENT_DATE - 7
            GROUP BY DATE(timestamp), status
            ORDER BY date DESC
        `;

        // Monthly breakdown
        const monthlyBreakdown = await sql`
            SELECT 
                TO_CHAR(timestamp, 'YYYY-MM') as month,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) as on_leave
            FROM attendance 
            WHERE usn_id = ${studentId}
            GROUP BY TO_CHAR(timestamp, 'YYYY-MM')
            ORDER BY month DESC
            LIMIT 6
        `;

        const overallData = overall[0] || { total: 0, present: 0, absent: 0, on_leave: 0 };
        const monthData = thisMonth[0] || { total: 0, present: 0, absent: 0, on_leave: 0 };

        return {
            success: true,
            data: {
                overall: {
                    total: parseInt(overallData.total),
                    present: parseInt(overallData.present),
                    absent: parseInt(overallData.absent),
                    on_leave: parseInt(overallData.on_leave),
                    attendance_rate: overallData.total > 0 ?
                        ((parseInt(overallData.present) / parseInt(overallData.total)) * 100).toFixed(1) : '0'
                },
                thisMonth: {
                    total: parseInt(monthData.total),
                    present: parseInt(monthData.present),
                    absent: parseInt(monthData.absent),
                    on_leave: parseInt(monthData.on_leave),
                    attendance_rate: monthData.total > 0 ?
                        ((parseInt(monthData.present) / parseInt(monthData.total)) * 100).toFixed(1) : '0'
                },
                weekTrend: weekTrend,
                monthlyBreakdown: monthlyBreakdown
            }
        };
    } catch (error) {
        console.error("Error fetching student stats:", error);
        return { success: false, message: "Failed to fetch statistics" };
    }
};

// Get today's menu
export const getTodayMenu = async () => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS menus (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            type VARCHAR(255) NOT NULL,
            items TEXT[] NOT NULL
        )`;

        const result = await sql`
            SELECT * FROM menus 
            WHERE date = CURRENT_DATE 
            ORDER BY 
                CASE type 
                    WHEN 'breakfast' THEN 1 
                    WHEN 'lunch' THEN 2 
                    WHEN 'snacks' THEN 3 
                    WHEN 'dinner' THEN 4 
                END
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching today's menu:", error);
        return { success: false, message: "Failed to fetch menu" };
    }
};

// Submit feedback/complaint
export const submitFeedback = async (data: Feedback) => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            user_name VARCHAR(255) NOT NULL,
            user_role VARCHAR(50) NOT NULL,
            category VARCHAR(50) NOT NULL,
            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
            subject VARCHAR(500) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            response TEXT,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP
        )`;

        const res = await sql`
            INSERT INTO feedback 
            (user_id, user_name, user_role, category, priority, subject, message, rating) 
            VALUES 
            (${data.user_id}, ${data.user_name}, ${data.user_role}, ${data.category}, ${data.priority}, ${data.subject}, ${data.message}, ${data.rating || null}) 
            RETURNING *
        `;

        if (res.length > 0) {
            return { success: true, message: "Feedback submitted successfully", data: res[0] };
        }
        return { success: false, message: "Failed to submit feedback" };
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return { success: false, message: "Failed to submit feedback" };
    }
};

// Get student's feedback history
export const getStudentFeedback = async (studentId: number) => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            user_name VARCHAR(255) NOT NULL,
            user_role VARCHAR(50) NOT NULL,
            category VARCHAR(50) NOT NULL,
            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
            subject VARCHAR(500) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            response TEXT,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP
        )`;

        const result = await sql`
            SELECT * FROM feedback 
            WHERE user_id = ${studentId}
            ORDER BY created_at DESC
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching student feedback:", error);
        return { success: false, message: "Failed to fetch feedback" };
    }
};

// Submit food rating
export const submitFoodRating = async (data: {
    user_id: number;
    user_name: string;
    menu_id: number;
    date: Date;
    meal_type: string;
    rating: number;
    comment?: string;
}) => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS food_ratings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            user_name VARCHAR(255) NOT NULL,
            menu_id INTEGER REFERENCES menus(id),
            date DATE NOT NULL,
            meal_type VARCHAR(50) NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, date, meal_type)
        )`;

        // Check if already rated
        const existing = await sql`
            SELECT id FROM food_ratings 
            WHERE user_id = ${data.user_id} 
            AND date = ${data.date} 
            AND meal_type = ${data.meal_type}
        `;

        if (existing.length > 0) {
            // Update existing rating
            const res = await sql`
                UPDATE food_ratings 
                SET rating = ${data.rating}, comment = ${data.comment || null}
                WHERE id = ${existing[0].id}
                RETURNING *
            `;
            return { success: true, message: "Rating updated successfully", data: res[0] };
        } else {
            // Insert new rating
            const res = await sql`
                INSERT INTO food_ratings 
                (user_id, user_name, menu_id, date, meal_type, rating, comment) 
                VALUES 
                (${data.user_id}, ${data.user_name}, ${data.menu_id || null}, ${data.date}, ${data.meal_type}, ${data.rating}, ${data.comment || null}) 
                RETURNING *
            `;
            return { success: true, message: "Rating submitted successfully", data: res[0] };
        }
    } catch (error) {
        console.error("Error submitting food rating:", error);
        return { success: false, message: "Failed to submit rating" };
    }
};

// Get student's food ratings
export const getStudentFoodRatings = async (studentId: number) => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS food_ratings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            user_name VARCHAR(255) NOT NULL,
            menu_id INTEGER REFERENCES menus(id),
            date DATE NOT NULL,
            meal_type VARCHAR(50) NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, date, meal_type)
        )`;

        const result = await sql`
            SELECT fr.*, m.items 
            FROM food_ratings fr
            LEFT JOIN menus m ON fr.menu_id = m.id
            WHERE fr.user_id = ${studentId}
            ORDER BY fr.date DESC, fr.meal_type
            LIMIT 30
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching food ratings:", error);
        return { success: false, message: "Failed to fetch ratings" };
    }
};

// Get food ratings for today (for display)
export const getTodayFoodRatings = async (studentId: number) => {
    try {
        const result = await sql`
            SELECT * FROM food_ratings 
            WHERE user_id = ${studentId}
            AND date = CURRENT_DATE
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching today's ratings:", error);
        return { success: false, message: "Failed to fetch ratings" };
    }
};

// Get active announcements for students
export const getStudentAnnouncements = async () => {
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

        const result = await sql`
            SELECT * FROM announcements 
            WHERE active = true 
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
            AND (target_audience = 'all' OR target_audience = 'students')
            ORDER BY priority DESC, created_at DESC
            LIMIT 20
        `;

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return { success: false, message: "Failed to fetch announcements" };
    }
};

// Get student dashboard summary
export const getStudentDashboardSummary = unstable_cache(
    async (studentId: number) => {
        try {
            // Get total feedback submitted
            const feedbackCount = await sql`
                SELECT COUNT(*) as count FROM feedback WHERE user_id = ${studentId}
            `;

            // Get pending feedback
            const pendingFeedback = await sql`
                SELECT COUNT(*) as count FROM feedback 
                WHERE user_id = ${studentId} AND status = 'pending'
            `;

            // Get total ratings given
            const ratingsCount = await sql`
                SELECT COUNT(*) as count FROM food_ratings WHERE user_id = ${studentId}
            `;

            // Get average rating given
            const avgRating = await sql`
                SELECT AVG(rating) as avg FROM food_ratings WHERE user_id = ${studentId}
            `;

            // Get active announcements count
            const announcementsCount = await sql`
                SELECT COUNT(*) as count FROM announcements 
                WHERE active = true 
                AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                AND (target_audience = 'all' OR target_audience = 'students')
            `;

            return {
                success: true,
                data: {
                    feedbackSubmitted: parseInt(feedbackCount[0]?.count || 0),
                    pendingFeedback: parseInt(pendingFeedback[0]?.count || 0),
                    ratingsGiven: parseInt(ratingsCount[0]?.count || 0),
                    averageRatingGiven: avgRating[0]?.avg ? parseFloat(avgRating[0].avg).toFixed(1) : '0',
                    activeAnnouncements: parseInt(announcementsCount[0]?.count || 0)
                }
            };
        } catch (error) {
            console.error("Error fetching dashboard summary:", error);
            return { success: false, message: "Failed to fetch summary" };
        }
    },
    ['student-dashboard-summary'],
    { revalidate: 60 }
);

// Get all complaints (for students - their own complaints)
export const getStudentComplaints = async (studentId: number) => {
    try {
        // Create complaints table if it doesn't exist
        await sql`
            CREATE TABLE IF NOT EXISTS complaints (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                student_name VARCHAR(255) NOT NULL,
                student_usn VARCHAR(50),
                category VARCHAR(50) NOT NULL,
                priority VARCHAR(20) DEFAULT 'medium',
                subject VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                response TEXT,
                responded_by VARCHAR(255),
                responded_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const complaints = await sql`
            SELECT * FROM complaints 
            WHERE user_id = ${studentId}
            ORDER BY created_at DESC
        `;

        return { success: true, data: complaints };
    } catch (error) {
        console.error("Error fetching complaints:", error);
        return { success: false, message: "Failed to fetch complaints" };
    }
};

// Submit a new complaint
export const submitComplaint = async (data: {
    user_id: number;
    student_name: string;
    student_usn: string;
    category: string;
    priority: string;
    subject: string;
    description: string;
}) => {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS complaints (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                student_name VARCHAR(255) NOT NULL,
                student_usn VARCHAR(50),
                category VARCHAR(50) NOT NULL,
                priority VARCHAR(20) DEFAULT 'medium',
                subject VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                response TEXT,
                responded_by VARCHAR(255),
                responded_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const result = await sql`
            INSERT INTO complaints (
                user_id, student_name, student_usn, category, priority, subject, description, status
            ) VALUES (
                ${data.user_id}, ${data.student_name}, ${data.student_usn}, ${data.category}, 
                ${data.priority}, ${data.subject}, ${data.description}, 'pending'
            )
            RETURNING *
        `;

        return { success: true, data: result[0], message: "Complaint submitted successfully" };
    } catch (error) {
        console.error("Error submitting complaint:", error);
        return { success: false, message: "Failed to submit complaint" };
    }
};

// Get all complaints (for admins and wardens)
export const getAllComplaints = async () => {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS complaints (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                student_name VARCHAR(255) NOT NULL,
                student_usn VARCHAR(50),
                category VARCHAR(50) NOT NULL,
                priority VARCHAR(20) DEFAULT 'medium',
                subject VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                response TEXT,
                responded_by VARCHAR(255),
                responded_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const complaints = await sql`
            SELECT * FROM complaints 
            ORDER BY 
                CASE priority
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END,
                created_at DESC
        `;

        return { success: true, data: complaints };
    } catch (error) {
        console.error("Error fetching all complaints:", error);
        return { success: false, message: "Failed to fetch complaints" };
    }
};

// Update complaint status and add response
export const updateComplaintStatus = async (
    complaintId: number,
    status: string,
    response?: string,
    respondedBy?: string
) => {
    try {
        let result;
        if (response && respondedBy) {
            result = await sql`
                UPDATE complaints 
                SET status = ${status}, 
                    response = ${response}, 
                    responded_by = ${respondedBy},
                    responded_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${complaintId}
                RETURNING *
            `;
        } else {
            result = await sql`
                UPDATE complaints 
                SET status = ${status},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${complaintId}
                RETURNING *
            `;
        }

        return { success: true, data: result[0], message: "Complaint updated successfully" };
    } catch (error) {
        console.error("Error updating complaint:", error);
        return { success: false, message: "Failed to update complaint" };
    }
};
