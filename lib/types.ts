import type { JWTPayload } from "jose";

export interface UserPayload extends JWTPayload {
  name?: string;
  usn_id?: string;
  role?: "student" | "warden" | "admin" | "canteen manager";
}
