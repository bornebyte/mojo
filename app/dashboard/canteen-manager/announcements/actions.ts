"use server"
import { sql } from "@/lib/db";
import { Announcement } from "@/lib/types";

export const createTableAnnouncements = async () => {
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
}

export const getAllAnnouncements = async () => {
    await createTableAnnouncements();
    const res = await sql`SELECT * FROM announcements ORDER BY created_at DESC`;
    if (res.length > 0) {
        return { success: true, message: "All announcements fetched successfully", data: res };
    }
    return { success: false, message: "No announcements found", data: null };
}

export const getActiveAnnouncements = async () => {
    await createTableAnnouncements();
    const res = await sql`
        SELECT * FROM announcements 
        WHERE active = true 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY priority DESC, created_at DESC
    `;
    if (res.length > 0) {
        return { success: true, message: "Active announcements fetched successfully", data: res };
    }
    return { success: false, message: "No active announcements found", data: null };
}

export const createAnnouncement = async (data: Announcement) => {
    await createTableAnnouncements();
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
    return { success: false, message: "Failed to create announcement", data: null };
}

export const updateAnnouncement = async (id: number, data: Partial<Announcement>) => {
    await createTableAnnouncements();
    const existingRes = await sql`SELECT * FROM announcements WHERE id = ${id}`;
    if (existingRes.length === 0) {
        return { success: false, message: "Announcement not found", data: null };
    }

    const existing = existingRes[0];
    const updated = {
        title: data.title || existing.title,
        message: data.message || existing.message,
        category: data.category || existing.category,
        priority: data.priority || existing.priority,
        target_audience: data.target_audience || existing.target_audience,
        active: data.active !== undefined ? data.active : existing.active,
        expires_at: data.expires_at !== undefined ? data.expires_at : existing.expires_at,
    };

    const res = await sql`
        UPDATE announcements 
        SET title = ${updated.title}, 
            message = ${updated.message}, 
            category = ${updated.category},
            priority = ${updated.priority},
            target_audience = ${updated.target_audience},
            active = ${updated.active},
            expires_at = ${updated.expires_at},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} 
        RETURNING *
    `;

    if (res.length > 0) {
        return { success: true, message: "Announcement updated successfully", data: res[0] };
    }
    return { success: false, message: "Failed to update announcement", data: null };
}

export const deleteAnnouncement = async (id: number) => {
    await createTableAnnouncements();
    const res = await sql`DELETE FROM announcements WHERE id = ${id} RETURNING *`;
    if (res.length > 0) {
        return { success: true, message: "Announcement deleted successfully", data: res[0] };
    }
    return { success: false, message: "Failed to delete announcement", data: null };
}

export const toggleAnnouncementStatus = async (id: number) => {
    await createTableAnnouncements();
    const res = await sql`
        UPDATE announcements 
        SET active = NOT active, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} 
        RETURNING *
    `;

    if (res.length > 0) {
        return { success: true, message: "Announcement status toggled successfully", data: res[0] };
    }
    return { success: false, message: "Failed to toggle announcement status", data: null };
}

export const getAnnouncementStats = async () => {
    await createTableAnnouncements();
    const total = await sql`SELECT COUNT(*) as count FROM announcements`;
    const active = await sql`SELECT COUNT(*) as count FROM announcements WHERE active = true`;
    const expired = await sql`SELECT COUNT(*) as count FROM announcements WHERE expires_at < CURRENT_TIMESTAMP`;

    return {
        success: true,
        data: {
            total: parseInt(total[0].count),
            active: parseInt(active[0].count),
            expired: parseInt(expired[0].count)
        }
    };
}
