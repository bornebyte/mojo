"use server"
import { sql } from "@/lib/db";
import { Feedback } from "@/lib/types";

export const createTableFeedback = async () => {
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
}

export const getAllFeedback = async () => {
    await createTableFeedback();
    const res = await sql`SELECT * FROM feedback ORDER BY created_at DESC`;
    if (res.length > 0) {
        return { success: true, message: "All feedback fetched successfully", data: res };
    }
    return { success: false, message: "No feedback found", data: null };
}

export const getFeedbackById = async (id: number) => {
    await createTableFeedback();
    const res = await sql`SELECT * FROM feedback WHERE id = ${id}`;
    if (res.length > 0) {
        return { success: true, message: "Feedback fetched successfully", data: res[0] };
    }
    return { success: false, message: "Feedback not found", data: null };
}

export const getFeedbackByStatus = async (status: string) => {
    await createTableFeedback();
    const res = await sql`SELECT * FROM feedback WHERE status = ${status} ORDER BY created_at DESC`;
    if (res.length > 0) {
        return { success: true, message: "Feedback fetched successfully", data: res };
    }
    return { success: false, message: "No feedback found for this status", data: null };
}

export const getFeedbackByCategory = async (category: string) => {
    await createTableFeedback();
    const res = await sql`SELECT * FROM feedback WHERE category = ${category} ORDER BY created_at DESC`;
    if (res.length > 0) {
        return { success: true, message: "Feedback fetched successfully", data: res };
    }
    return { success: false, message: "No feedback found for this category", data: null };
}

export const getFeedbackByPriority = async (priority: string) => {
    await createTableFeedback();
    const res = await sql`SELECT * FROM feedback WHERE priority = ${priority} ORDER BY created_at DESC`;
    if (res.length > 0) {
        return { success: true, message: "Feedback fetched successfully", data: res };
    }
    return { success: false, message: "No feedback found for this priority", data: null };
}

export const updateFeedbackStatus = async (id: number, status: string, response?: string) => {
    await createTableFeedback();
    const resolvedAt = status === 'resolved' ? new Date() : null;

    const res = await sql`
        UPDATE feedback 
        SET status = ${status}, 
            response = ${response || null}, 
            updated_at = CURRENT_TIMESTAMP,
            resolved_at = ${resolvedAt}
        WHERE id = ${id} 
        RETURNING *
    `;

    if (res.length > 0) {
        return { success: true, message: "Feedback status updated successfully", data: res[0] };
    }
    return { success: false, message: "Failed to update feedback status", data: null };
}

export const deleteFeedback = async (id: number) => {
    await createTableFeedback();
    const res = await sql`DELETE FROM feedback WHERE id = ${id} RETURNING *`;
    if (res.length > 0) {
        return { success: true, message: "Feedback deleted successfully", data: res[0] };
    }
    return { success: false, message: "Failed to delete feedback", data: null };
}

export const getFeedbackStats = async () => {
    await createTableFeedback();
    const total = await sql`SELECT COUNT(*) as count FROM feedback`;
    const pending = await sql`SELECT COUNT(*) as count FROM feedback WHERE status = 'pending'`;
    const resolved = await sql`SELECT COUNT(*) as count FROM feedback WHERE status = 'resolved'`;
    const highPriority = await sql`SELECT COUNT(*) as count FROM feedback WHERE priority = 'high' OR priority = 'urgent'`;

    const avgRating = await sql`SELECT AVG(rating) as avg FROM feedback WHERE rating IS NOT NULL`;

    return {
        success: true,
        data: {
            total: parseInt(total[0].count),
            pending: parseInt(pending[0].count),
            resolved: parseInt(resolved[0].count),
            highPriority: parseInt(highPriority[0].count),
            averageRating: avgRating[0].avg ? parseFloat(avgRating[0].avg).toFixed(1) : 0
        }
    };
}

export const createFeedback = async (data: Feedback) => {
    await createTableFeedback();
    const res = await sql`
        INSERT INTO feedback 
        (user_id, user_name, user_role, category, priority, subject, message, rating) 
        VALUES 
        (${data.user_id}, ${data.user_name}, ${data.user_role}, ${data.category}, ${data.priority}, ${data.subject}, ${data.message}, ${data.rating || null}) 
        RETURNING *
    `;

    if (res.length > 0) {
        return { success: true, message: "Feedback created successfully", data: res[0] };
    }
    return { success: false, message: "Failed to create feedback", data: null };
}
