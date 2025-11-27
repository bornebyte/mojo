import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

// Configure with connection pooling and timeout settings
export const sql = neon(process.env.DATABASE_URL, {
    fetchOptions: {
        priority: "high",
    },
});

