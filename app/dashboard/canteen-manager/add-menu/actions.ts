"use server"
import { sql } from "@/lib/db";
import { Menu } from "@/lib/types";
// import { neon } from "@neondatabase/serverless";

export const createTableMenu = async () => {
    // const res = neon(process.env.DATABASE_URL!)
    await sql`CREATE TABLE IF NOT EXISTS menus (
                id SERIAL PRIMARY KEY,
                date DATE NOT NULL,
                type VARCHAR(255) NOT NULL,
                items TEXT[] NOT NULL
            )`;
}

export const saveMenu = async (data: Menu) => {
    await createTableMenu();
    const res = await sql`INSERT INTO menus (date, type, items) VALUES (${data.date}, ${data.type}, ${data.items}) RETURNING *`;

    if (res.length > 0) {
        return { success: true, message: "Menu saved successfully", data: res[0] };
    }
    return { success: false, message: "Failed to save menu", data: null };
}

export const getMenuByDateAndType = async (date: Date, type: string) => {
    await createTableMenu();
    const res = await sql`SELECT * FROM menus WHERE date = ${date} AND type = ${type}`;
    if (res.length > 0) {
        return { success: true, message: "Menu fetched successfully", data: res[0] };
    }
    return { success: false, message: "No menu found for the given date and type", data: null };
}

export const getMenusByDate = async (date: Date) => {
    await createTableMenu();
    const res = await sql`SELECT * FROM menus WHERE date = ${date}`;
    if (res.length > 0) {
        return { success: true, message: "Menus fetched successfully", data: res };
    }
    return { success: false, message: "No menus found for the given date", data: null };
}

export const getAllMenus = async () => {
    await createTableMenu();
    const res = await sql`SELECT * FROM menus ORDER BY date DESC`;
    if (res.length > 0) {
        return { success: true, message: "All menus fetched successfully", data: res };
    }
    return { success: false, message: "No menus found", data: null };
}

export const deleteMenuById = async (id: number) => {
    await createTableMenu();
    const res = await sql`DELETE FROM menus WHERE id = ${id} RETURNING *`;
    if (res.length > 0) {
        return { success: true, message: "Menu deleted successfully", data: res[0] };
    }
    return { success: false, message: "Failed to delete menu", data: null };
}

export const updateMenuById = async (id: number, data: Partial<Menu>) => {
    await createTableMenu();
    const existingMenuRes = await sql`SELECT * FROM menus WHERE id = ${id}`;
    if (existingMenuRes.length === 0) {
        return { success: false, message: "Menu not found", data: null };
    }
    const existingMenu = existingMenuRes[0];

    const updatedMenu = {
        date: data.date || existingMenu.date,
        type: data.type || existingMenu.type,
        items: data.items || existingMenu.items,
    };

    const res = await sql`UPDATE menus SET date = ${updatedMenu.date}, type = ${updatedMenu.type}, items = ${updatedMenu.items} WHERE id = ${id} RETURNING *`;

    if (res.length > 0) {
        return { success: true, message: "Menu updated successfully", data: res[0] };
    }
    return { success: false, message: "Failed to update menu", data: null };
}

export const getMenusByType = async (type: string) => {
    await createTableMenu();
    const res = await sql`SELECT * FROM menus WHERE type = ${type} ORDER BY date DESC`;
    if (res.length > 0) {
        return { success: true, message: "Menus fetched successfully", data: res };
    }
    return { success: false, message: "No menus found for the given type", data: null };
}

export const getMenusInDateRange = async (startDate: Date, endDate: Date) => {
    await createTableMenu();
    const res = await sql`SELECT * FROM menus WHERE date BETWEEN ${startDate} AND ${endDate} ORDER BY date DESC`;
    if (res.length > 0) {
        return { success: true, message: "Menus fetched successfully", data: res };
    }
    return { success: false, message: "No menus found in the given date range", data: null };
}

export const deleteMenusByDate = async (date: Date) => {
    await createTableMenu();
    const res = await sql`DELETE FROM menus WHERE date = ${date} RETURNING *`;
    if (res.length > 0) {
        return { success: true, message: "Menus deleted successfully", data: res };
    }
    return { success: false, message: "No menus found for the given date to delete", data: null };
}

export const deleteAllMenus = async () => {
    await createTableMenu();
    const res = await sql`DELETE FROM menus RETURNING *`;
    if (res.length > 0) {
        return { success: true, message: "All menus deleted successfully", data: res };
    }
    return { success: false, message: "No menus found to delete", data: null };
}

export const countMenus = async () => {
    await createTableMenu();
    const res = await sql`SELECT COUNT(*) FROM menus`;
    return { success: true, message: "Menu count fetched successfully", data: parseInt(res[0].count, 10) };
}
