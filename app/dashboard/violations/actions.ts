"use server"

import { neon } from "@neondatabase/serverless";
import { Violation, ViolationStats } from "@/lib/types";

const sql = neon(process.env.DATABASE_URL!);

export async function createViolationsTable() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS violations (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        student_name TEXT NOT NULL,
        student_usn TEXT NOT NULL,
        student_building TEXT NOT NULL,
        student_floor TEXT NOT NULL,
        student_room TEXT NOT NULL,
        violation_type TEXT NOT NULL CHECK (violation_type IN ('smoking', 'alcohol', 'property_damage', 'noise_complaint', 'unauthorized_guest', 'curfew_violation', 'mess_misbehavior', 'ragging', 'other')),
        severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'critical')),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT,
        estimated_damage_cost DECIMAL(10, 2),
        evidence_photo_url TEXT,
        status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'under_review', 'action_taken', 'resolved', 'dismissed')),
        action_taken TEXT,
        fine_amount DECIMAL(10, 2),
        fine_paid BOOLEAN DEFAULT FALSE,
        reported_by_id INTEGER NOT NULL,
        reported_by_name TEXT NOT NULL,
        reported_by_role TEXT NOT NULL,
        reviewed_by_id INTEGER,
        reviewed_by_name TEXT,
        incident_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      )
    `;

        // Create indexes for better query performance
        await sql`CREATE INDEX IF NOT EXISTS idx_violations_student_id ON violations(student_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_violations_severity ON violations(severity)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_violations_type ON violations(violation_type)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_violations_date ON violations(incident_date)`;

        return { success: true, message: "Violations table created successfully" };
    } catch (error: any) {
        console.error("Error creating violations table:", error);
        return { success: false, message: error.message };
    }
}

export async function fileViolation(violation: Omit<Violation, 'id' | 'created_at' | 'updated_at'>) {
    try {
        const result = await sql`
      INSERT INTO violations (
        student_id, student_name, student_usn, student_building, student_floor, student_room,
        violation_type, severity, title, description, location, estimated_damage_cost,
        evidence_photo_url, reported_by_id, reported_by_name, reported_by_role, incident_date
      ) VALUES (
        ${violation.student_id}, ${violation.student_name}, ${violation.student_usn},
        ${violation.student_building}, ${violation.student_floor}, ${violation.student_room},
        ${violation.violation_type}, ${violation.severity}, ${violation.title},
        ${violation.description}, ${violation.location || null}, ${violation.estimated_damage_cost || null},
        ${violation.evidence_photo_url || null}, ${violation.reported_by_id},
        ${violation.reported_by_name}, ${violation.reported_by_role}, ${violation.incident_date}
      )
      RETURNING *
    `;

        return { success: true, message: "Violation filed successfully", data: result[0] };
    } catch (error: any) {
        console.error("Error filing violation:", error);
        return { success: false, message: error.message };
    }
}

export async function getAllViolations() {
    try {
        const result = await sql`
      SELECT * FROM violations
      ORDER BY created_at DESC
    `;

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error fetching violations:", error);
        return { success: false, message: error.message, data: [] };
    }
}

export async function getViolationsByStudent(studentId: number) {
    try {
        const result = await sql`
      SELECT * FROM violations
      WHERE student_id = ${studentId}
      ORDER BY created_at DESC
    `;

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error fetching student violations:", error);
        return { success: false, message: error.message, data: [] };
    }
}

export async function getViolationsByBuilding(building: string, floor?: string) {
    try {
        let result;
        if (floor) {
            result = await sql`
        SELECT * FROM violations
        WHERE student_building = ${building} AND student_floor = ${floor}
        ORDER BY created_at DESC
      `;
        } else {
            result = await sql`
        SELECT * FROM violations
        WHERE student_building = ${building}
        ORDER BY created_at DESC
      `;
        }

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error fetching violations by building:", error);
        return { success: false, message: error.message, data: [] };
    }
}

export async function updateViolation(
    id: number,
    updates: {
        status?: string;
        action_taken?: string;
        fine_amount?: number;
        reviewed_by_id?: number;
        reviewed_by_name?: string;
        resolved_at?: string;
    }
) {
    try {
        const setClause = [];
        const values = [];

        if (updates.status !== undefined) {
            setClause.push(`status = $${setClause.length + 1}`);
            values.push(updates.status);
        }
        if (updates.action_taken !== undefined) {
            setClause.push(`action_taken = $${setClause.length + 1}`);
            values.push(updates.action_taken);
        }
        if (updates.fine_amount !== undefined) {
            setClause.push(`fine_amount = $${setClause.length + 1}`);
            values.push(updates.fine_amount);
        }
        if (updates.reviewed_by_id !== undefined) {
            setClause.push(`reviewed_by_id = $${setClause.length + 1}`);
            values.push(updates.reviewed_by_id);
        }
        if (updates.reviewed_by_name !== undefined) {
            setClause.push(`reviewed_by_name = $${setClause.length + 1}`);
            values.push(updates.reviewed_by_name);
        }
        if (updates.resolved_at !== undefined) {
            setClause.push(`resolved_at = $${setClause.length + 1}`);
            values.push(updates.resolved_at);
        }

        setClause.push(`updated_at = NOW()`);

        const result = await sql`
      UPDATE violations
      SET status = ${updates.status || sql`status`},
          action_taken = ${updates.action_taken || sql`action_taken`},
          fine_amount = ${updates.fine_amount !== undefined ? updates.fine_amount : sql`fine_amount`},
          reviewed_by_id = ${updates.reviewed_by_id || sql`reviewed_by_id`},
          reviewed_by_name = ${updates.reviewed_by_name || sql`reviewed_by_name`},
          resolved_at = ${updates.resolved_at || sql`resolved_at`},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

        return { success: true, message: "Violation updated successfully", data: result[0] };
    } catch (error: any) {
        console.error("Error updating violation:", error);
        return { success: false, message: error.message };
    }
}

export async function markFineAsPaid(id: number) {
    try {
        const result = await sql`
      UPDATE violations
      SET fine_paid = TRUE, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

        return { success: true, message: "Fine marked as paid", data: result[0] };
    } catch (error: any) {
        console.error("Error marking fine as paid:", error);
        return { success: false, message: error.message };
    }
}

export async function getViolationStats(): Promise<{ success: boolean; data?: ViolationStats; message?: string }> {
    try {
        const result = await sql`
      SELECT
        COUNT(*)::int as total_violations,
        COUNT(CASE WHEN severity = 'minor' THEN 1 END)::int as minor,
        COUNT(CASE WHEN severity = 'moderate' THEN 1 END)::int as moderate,
        COUNT(CASE WHEN severity = 'severe' THEN 1 END)::int as severe,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END)::int as critical,
        COUNT(CASE WHEN violation_type = 'smoking' THEN 1 END)::int as smoking,
        COUNT(CASE WHEN violation_type = 'alcohol' THEN 1 END)::int as alcohol,
        COUNT(CASE WHEN violation_type = 'property_damage' THEN 1 END)::int as property_damage,
        COUNT(CASE WHEN violation_type = 'noise_complaint' THEN 1 END)::int as noise_complaint,
        COUNT(CASE WHEN violation_type = 'unauthorized_guest' THEN 1 END)::int as unauthorized_guest,
        COUNT(CASE WHEN violation_type = 'curfew_violation' THEN 1 END)::int as curfew_violation,
        COUNT(CASE WHEN violation_type = 'mess_misbehavior' THEN 1 END)::int as mess_misbehavior,
        COUNT(CASE WHEN violation_type = 'ragging' THEN 1 END)::int as ragging,
        COUNT(CASE WHEN violation_type = 'other' THEN 1 END)::int as other,
        COUNT(CASE WHEN status = 'reported' THEN 1 END)::int as reported,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END)::int as under_review,
        COUNT(CASE WHEN status = 'action_taken' THEN 1 END)::int as action_taken,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END)::int as resolved,
        COUNT(CASE WHEN status = 'dismissed' THEN 1 END)::int as dismissed,
        COALESCE(SUM(fine_amount), 0)::float as total_fines,
        COALESCE(SUM(CASE WHEN fine_paid = TRUE THEN fine_amount ELSE 0 END), 0)::float as fines_collected
      FROM violations
    `;

        const row = result[0];

        const stats: ViolationStats = {
            total_violations: row.total_violations,
            by_severity: {
                minor: row.minor,
                moderate: row.moderate,
                severe: row.severe,
                critical: row.critical
            },
            by_type: {
                smoking: row.smoking,
                alcohol: row.alcohol,
                property_damage: row.property_damage,
                noise_complaint: row.noise_complaint,
                unauthorized_guest: row.unauthorized_guest,
                curfew_violation: row.curfew_violation,
                mess_misbehavior: row.mess_misbehavior,
                ragging: row.ragging,
                other: row.other
            },
            by_status: {
                reported: row.reported,
                under_review: row.under_review,
                action_taken: row.action_taken,
                resolved: row.resolved,
                dismissed: row.dismissed
            },
            total_fines: row.total_fines,
            fines_collected: row.fines_collected
        };

        return { success: true, data: stats };
    } catch (error: any) {
        console.error("Error fetching violation stats:", error);
        return { success: false, message: error.message };
    }
}

export async function deleteViolation(id: number) {
    try {
        await sql`DELETE FROM violations WHERE id = ${id}`;
        return { success: true, message: "Violation deleted successfully" };
    } catch (error: any) {
        console.error("Error deleting violation:", error);
        return { success: false, message: error.message };
    }
}
