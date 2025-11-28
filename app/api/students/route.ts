import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
    try {
        const students = await sql`
      SELECT 
        id,
        name,
        email,
        phone,
        usn_id,
        allocated_building,
        allocated_floor,
        allocated_room,
        status
      FROM users
      WHERE role = 'student'
      ORDER BY name ASC
    `;

        return NextResponse.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json(
            { error: "Failed to fetch students" },
            { status: 500 }
        );
    }
}
