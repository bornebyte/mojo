"use server"
import { neon } from "@neondatabase/serverless";
import { AES } from "crypto-js";

type UserRole = "student" | "warden" | "admin" | "canteen manager";

export async function createUserTable() {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    const sql = neon(process.env.DATABASE_URL);

    const data = await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20),
      password VARCHAR(255),
      role VARCHAR(255) DEFAULT 'admin',
      usn_id VARCHAR(50) UNIQUE,
      added_by_name VARCHAR(255),
      added_by_id VARCHAR(50),
      added_by_role VARCHAR(255), 
      status VARCHAR(255) DEFAULT 'active',
      hold_reason TEXT,
      allocated_building VARCHAR(255),  -- The building assigned for accommodation
      allocated_floor VARCHAR(255),     -- The floor assigned for accommodation
      allocated_room VARCHAR(255),      -- The room assigned for accommodation
      assigned_building VARCHAR(255),   -- The building assigned for warden duties
      assigned_floor VARCHAR(255),      -- The floor assigned for warden duties
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    return data;
}

export const createUser = async (name: string, email: string, phone: string, password: string, role: UserRole, usn_id: string | null, added_by_name: string, added_by_id: string, added_by_role: UserRole, allocated_building?: string | null, allocated_floor?: string | null, allocated_room?: string | null, assigned_building?: string | null, assigned_floor_ids?: number[] | null) => {
    await createUserTable();
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    const sql = neon(process.env.DATABASE_URL);
    const existingUser = await sql`SELECT email FROM users WHERE email = ${email} OR (usn_id = ${usn_id} AND usn_id IS NOT NULL)`;
    if (existingUser.length > 0) {
        return { message: "User already exists", accountcreated: false };
    }
    if (!process.env.SECRET_KEY) throw new Error("SECRET_KEY is not set");
    const encryptedPassword = AES.encrypt(password, process.env.SECRET_KEY as string).toString();

    await sql`
        INSERT INTO users (name, email, phone, password, role, usn_id, added_by_name, added_by_id, added_by_role, allocated_building, allocated_floor, allocated_room, assigned_building, assigned_floor)
        VALUES (${name}, ${email}, ${phone}, ${encryptedPassword}, ${role}, ${usn_id}, ${added_by_name}, ${added_by_id}, ${added_by_role}, ${allocated_building || null}, ${allocated_floor || null}, ${allocated_room || null}, ${assigned_building || null}, ${assigned_floor_ids ? JSON.stringify(assigned_floor_ids) : null})
        RETURNING id
    ` as { id: number }[];

    return { message: "Account created successfully", accountcreated: true };
};

export const getAvailableBuildingsAndFloors = async () => {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

    const sql = neon(process.env.DATABASE_URL);

    // Ensure supporting tables exist
    await sql`CREATE TABLE IF NOT EXISTS buildings (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL);`;
    await sql`CREATE TABLE IF NOT EXISTS floors (id SERIAL PRIMARY KEY, building_id INTEGER REFERENCES buildings(id), floor_number INTEGER);`;

    // Fetch buildings with their floors
    const buildingsData = await sql`
        SELECT
            b.name AS building_name,
            f.floor_number
        FROM
            buildings b
        JOIN
            floors f ON b.id = f.building_id
        ORDER BY
            b.name, f.floor_number;
    `;

    // Organize data into desired structure
    const buildings: { name: string; floors: number[] }[] = [];
    let currentBuilding: { name: string; floors: number[] } | null = null;

    buildingsData.forEach((building) => {
        if (currentBuilding === null || currentBuilding.name !== building.building_name) {
            currentBuilding = { name: building.building_name, floors: [] };
            buildings.push(currentBuilding);
        }
        currentBuilding.floors.push(building.floor_number);
    });

    return buildings;
};

export const getAvailableRooms = async (building: string, floor: number) => {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

    const sql = neon(process.env.DATABASE_URL);

    // Ensure supporting tables exist
    await sql`CREATE TABLE IF NOT EXISTS buildings (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL);`;
    await sql`CREATE TABLE IF NOT EXISTS floors (id SERIAL PRIMARY KEY, building_id INTEGER REFERENCES buildings(id), floor_number INTEGER);`;
    await sql`CREATE TABLE IF NOT EXISTS rooms (id SERIAL PRIMARY KEY, floor_id INTEGER REFERENCES floors(id), name VARCHAR(255), bed_count INTEGER);`;

    // Fetch buildings with their floors and rooms
    const available_rooms = await sql`
        SELECT allocated_room FROM users WHERE allocated_building = ${building} AND allocated_floor = ${floor}
    `;
    available_rooms.forEach((room, index) => {
        available_rooms[index] = room.allocated_room;
    }); 
    const rooms_data = await sql`
        SELECT
            b.name AS building_name,
            f.floor_number,
            r.name AS room_name,
            r.bed_count
        FROM
            buildings b
        JOIN
            floors f ON b.id = f.building_id
        JOIN
            rooms r ON f.id = r.floor_id
        WHERE
            b.name = ${building} AND f.floor_number = ${floor};
    `;

    const roomsWithOccupancy = rooms_data.map((room) => {
        const occupiedBeds = available_rooms.filter((allocatedRoom) => allocatedRoom === room.room_name).length;
        return {
            room_name: room.room_name,
            floor_number: room.floor_number,
            total_beds: room.bed_count,
            occupied_beds: occupiedBeds,
        };
    });

    return roomsWithOccupancy.filter(room => room.total_beds !== room.occupied_beds);
};

export const getAvailableFloorsForWarden = async (building: string) => {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

    const sql = neon(process.env.DATABASE_URL);

    // Ensure supporting tables exist
    await sql`CREATE TABLE IF NOT EXISTS buildings (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL);`;
    await sql`CREATE TABLE IF NOT EXISTS floors (id SERIAL PRIMARY KEY, building_id INTEGER REFERENCES buildings(id), floor_number INTEGER);`;

    // 1. Fetch all floors for the given building
    const floorsData = await sql`
        SELECT
            f.floor_number,
            b.id as building_id
        FROM
            buildings b
        JOIN
            floors f ON b.id = f.building_id
        WHERE
            b.name = ${building};
    `;
    const allFloors = floorsData.map((floor) => floor.floor_number);

    // 2. Fetch all floors assigned to wardens in that building
    const assignedFloorsData = await sql`
        SELECT assigned_floor
        FROM users
        WHERE role = 'warden' AND assigned_building = ${building} AND assigned_floor IS NOT NULL;
    `;

    // 3. Flatten the assigned floors into a single set
    const assignedFloors = new Set<number>();
    assignedFloorsData.forEach(row => {
        JSON.parse(row.assigned_floor).forEach((floor: number) => assignedFloors.add(floor));
    });

    // 4. Filter out the assigned floors to find the available ones
    const availableFloors = allFloors.filter(floor => !assignedFloors.has(floor));

    return availableFloors.sort((a, b) => a - b);
}