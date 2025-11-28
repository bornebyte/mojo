"use server"

import { UserPayload, BuildingData } from "@/lib/types";
import { BuildingFormValues } from "./ManageBuildingsForm";
import { sql } from "@/lib/db";
import { NeonQueryPromise } from "@neondatabase/serverless";

async function createBuildingsTables() {
    await sql.query(`CREATE TABLE IF NOT EXISTS buildings (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            added_by_name VARCHAR(255) NOT NULL,
            added_by_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
}

async function createFloorsTables() {
    await createBuildingsTables();
    await sql.query(`
        CREATE TABLE IF NOT EXISTS floors (
            id SERIAL PRIMARY KEY,
            building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE NOT NULL,
            floor_number INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(building_id, floor_number)
        );
    `);
}

async function createRoomsTables() {
    await createFloorsTables();
    await sql.query(`
        CREATE TABLE IF NOT EXISTS rooms (
            id SERIAL PRIMARY KEY,
            floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE NOT NULL,
            name VARCHAR(255) NOT NULL,
            bed_count INTEGER NOT NULL,
            status VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export async function createBuilding(values: BuildingFormValues, user: UserPayload) {
    await createRoomsTables();

    try {
        // The transaction function expects an array of queries, not an async function.
        // We can't get the buildingId and use it in subsequent queries within the same transaction block with the serverless driver's HTTP endpoint.
        // A multi-step approach or a stored procedure would be needed for that.
        // For now, let's assume we can create them in separate transactions or that this is a simplified use case.
        // A practical approach for this form would be to insert the building first, get the ID, then insert floors and rooms.

        // Step 1: Create the building and get its ID.
        const buildingResult = await sql`INSERT INTO buildings (name, added_by_name, added_by_id) VALUES (${values.buildingName}, ${user.name}, ${user.usn_id}) RETURNING id`;
        const buildingId = buildingResult[0].id;

        // Step 2: Create floors.
        const floorQueries: NeonQueryPromise<false, false>[] = [];
        for (let i = 0; i <= parseInt(values.no_of_floors); i++) {
            floorQueries.push(sql`INSERT INTO floors (building_id, floor_number) VALUES (${buildingId}, ${i})`);
        }
        await sql.transaction(floorQueries);

        // Step 3: Create rooms in a transaction.
        const roomQueries: NeonQueryPromise<false, false>[] = [];
        let roomIndex = 0;
        for (let i = 0; i <= parseInt(values.no_of_floors); i++) {
            const roomCount = values.floors[i].roomCount;
            for (let j = 0; j < roomCount; j++) {
                const room = values.rooms[roomIndex++];
                roomQueries.push(sql`INSERT INTO rooms (floor_id, name, bed_count, status) VALUES ((SELECT id FROM floors WHERE building_id = ${buildingId} AND floor_number = ${i}), ${room.roomName}, ${room.bedCount}, ${room.status})`);
            }
        }
        await sql.transaction(roomQueries);

        return { success: true, message: "Building created successfully!" };
    } catch (error) {
        console.error("Failed to create building:", error);
        return { success: false, message: "Failed to create building. Please check the logs." };
    }
}

export async function getBuildings(): Promise<BuildingData[]> {
    await createRoomsTables();
    try {
        const buildings = await sql`
        SELECT 
            b.id AS building_id,
            b.name AS building_name,
            b.added_by_name,
            b.added_by_id,
            b.created_at,
            COALESCE(json_agg(
                json_build_object(
                    'floor_id', f.id,
                    'floor_number', f.floor_number,
                    'rooms', COALESCE((
                        SELECT json_agg(
                            json_build_object(
                                'room_id', r.id,
                                'name', r.name,
                                'bed_count', r.bed_count,
                                'status', r.status,
                                'beds_occupied', (
                                    SELECT COUNT(*)::int FROM users u WHERE u.allocated_room = r.name AND u.allocated_floor = f.floor_number::varchar AND u.allocated_building = b.name
                                ),
                                'created_at', r.created_at
                            )
                        )
                        FROM rooms r
                        WHERE r.floor_id = f.id
                    ), '[]'::json)
                )
            ) FILTER (WHERE f.id IS NOT NULL), '[]'::json) AS floors
        FROM buildings b
        LEFT JOIN floors f ON f.building_id = b.id
        GROUP BY b.id
        ORDER BY b.created_at DESC
    `;
        return buildings as BuildingData[];
    } catch (error) {
        console.error("Failed to fetch buildings:", error);
        return [];
    }

}

export async function deleteBuilding(buildingId: number) {
    try {
        // Check if there are any students allocated to this building
        const studentsCheck = await sql`
            SELECT COUNT(*)::int as count 
            FROM users 
            WHERE allocated_building = (SELECT name FROM buildings WHERE id = ${buildingId})
        `;

        if (studentsCheck[0]?.count > 0) {
            return {
                success: false,
                message: `Cannot delete building. ${studentsCheck[0].count} student(s) are still allocated to this building.`
            };
        }

        // Delete the building (cascade will delete floors and rooms)
        await sql`DELETE FROM buildings WHERE id = ${buildingId}`;

        return { success: true, message: "Building deleted successfully!" };
    } catch (error) {
        console.error("Failed to delete building:", error);
        return { success: false, message: "Failed to delete building. Please try again." };
    }
}

export async function renameBuilding(buildingId: number, newName: string) {
    try {
        // Check if building name already exists
        const existingBuilding = await sql`
            SELECT id FROM buildings WHERE name = ${newName} AND id != ${buildingId}
        `;

        if (existingBuilding.length > 0) {
            return { success: false, message: "A building with this name already exists." };
        }

        // Get old name for updating user allocations
        const oldNameResult = await sql`SELECT name FROM buildings WHERE id = ${buildingId}`;
        const oldName = oldNameResult[0]?.name;

        if (!oldName) {
            return { success: false, message: "Building not found." };
        }

        // Update building name
        await sql`UPDATE buildings SET name = ${newName} WHERE id = ${buildingId}`;

        // Update user allocations
        await sql`UPDATE users SET allocated_building = ${newName} WHERE allocated_building = ${oldName}`;

        return { success: true, message: "Building renamed successfully!" };
    } catch (error) {
        console.error("Failed to rename building:", error);
        return { success: false, message: "Failed to rename building. Please try again." };
    }
}

export async function deleteManyBuildings(buildingIds: number[]) {
    try {
        // Check for allocated students in any of these buildings
        const studentsCheck = await sql`
            SELECT 
                b.id,
                b.name,
                COUNT(u.id)::int as student_count
            FROM buildings b
            LEFT JOIN users u ON u.allocated_building = b.name
            WHERE b.id = ANY(${buildingIds})
            GROUP BY b.id, b.name
        `;

        const buildingsWithStudents = studentsCheck.filter(b => b.student_count > 0);

        if (buildingsWithStudents.length > 0) {
            const buildingNames = buildingsWithStudents.map(b => `${b.name} (${b.student_count} students)`).join(', ');
            return {
                success: false,
                message: `Cannot delete the following buildings with allocated students: ${buildingNames}`
            };
        }

        // Delete buildings (cascade will delete floors and rooms)
        await sql`DELETE FROM buildings WHERE id = ANY(${buildingIds})`;

        return {
            success: true,
            message: `Successfully deleted ${buildingIds.length} building(s)!`
        };
    } catch (error) {
        console.error("Failed to delete buildings:", error);
        return { success: false, message: "Failed to delete buildings. Please try again." };
    }
}
