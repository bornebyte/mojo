"use server"

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Get all menus
export const getAllMenus = async () => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS menus (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
            items TEXT[] NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(date, type)
        )`;

        const menus = await sql`SELECT * FROM menus ORDER BY date DESC, type ASC`;
        return { success: true, data: menus };
    } catch (error) {
        console.error("Error fetching menus:", error);
        return { success: false, message: "Failed to fetch menus" };
    }
};

// Submit food rating
export const submitFoodRating = async (data: {
    user_id: number;
    user_name: string;
    menu_id: number;
    menu_date: string;
    menu_type: string;
    rating: number;
    comment?: string;
}) => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS food_ratings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            user_name VARCHAR(255) NOT NULL,
            menu_id INTEGER NOT NULL,
            menu_date DATE NOT NULL,
            menu_type VARCHAR(20) NOT NULL,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, menu_id)
        )`;

        const existing = await sql`
            SELECT * FROM food_ratings 
            WHERE user_id = ${data.user_id} AND menu_id = ${data.menu_id}
        `;

        if (existing.length > 0) {
            // Update existing rating
            const res = await sql`
                UPDATE food_ratings 
                SET rating = ${data.rating}, comment = ${data.comment || null}, created_at = CURRENT_TIMESTAMP
                WHERE user_id = ${data.user_id} AND menu_id = ${data.menu_id}
                RETURNING *
            `;
            return { success: true, message: "Rating updated successfully", data: res[0] };
        } else {
            // Insert new rating
            const res = await sql`
                INSERT INTO food_ratings (user_id, user_name, menu_id, menu_date, menu_type, rating, comment)
                VALUES (${data.user_id}, ${data.user_name}, ${data.menu_id}, ${data.menu_date}, ${data.menu_type}, ${data.rating}, ${data.comment || null})
                RETURNING *
            `;
            return { success: true, message: "Rating submitted successfully", data: res[0] };
        }
    } catch (error) {
        console.error("Error submitting rating:", error);
        return { success: false, message: "Failed to submit rating" };
    }
};

// Get user's rating for a specific menu
export const getUserRating = async (userId: number, menuId: number) => {
    try {
        const rating = await sql`
            SELECT * FROM food_ratings 
            WHERE user_id = ${userId} AND menu_id = ${menuId}
        `;
        return { success: true, data: rating[0] || null };
    } catch (error) {
        console.error("Error fetching rating:", error);
        return { success: false, message: "Failed to fetch rating" };
    }
};

// Get average ratings for all menus
export const getMenuRatings = async () => {
    try {
        const ratings = await sql`
            SELECT 
                menu_id,
                menu_date,
                menu_type,
                AVG(rating) as avg_rating,
                COUNT(*) as total_ratings
            FROM food_ratings
            GROUP BY menu_id, menu_date, menu_type
        `;
        return { success: true, data: ratings };
    } catch (error) {
        console.error("Error fetching menu ratings:", error);
        return { success: false, message: "Failed to fetch ratings" };
    }
};
