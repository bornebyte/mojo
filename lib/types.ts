import type { JWTPayload } from "jose";

export interface UserPayload extends JWTPayload {
  name?: string;
  usn_id?: string;
  role?: "student" | "warden" | "admin" | "canteen manager";
}

export type BuildingData = {
  building_id: number;
  building_name: string;
  added_by_name: string;
  added_by_id: string;
  created_at: string;
  floors: {
    floor_id: number;
    floor_number: number;
    rooms: {
      room_id: number;
      name: string;
      bed_count: number;
      status: string;
      beds_occupied: number;
      created_at: string;
    }[];
  }[];
}

export type AvailableBuildingsAndFloors = {
  id: number;
  name: string;
  floors: {
    id: any;
    rooms: any;
    building_id: number;
    floor_number: number;
  }[];
}
