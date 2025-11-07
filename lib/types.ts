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
  name: string;
  floors: number[];
}

export type AvailableRooms = {
  room_name: string;
  floor_number: number;
  total_beds: number;
  occupied_beds: number;
};

export type BuildingAllUsers = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  usn_id: string | null;
  added_by_name: string | null;
  added_by_id: string | null;
  added_by_role: string | null;
  status: string;
  hold_reason: string | null;
  allocated_building: string | null;
  allocated_floor: string | null;
  allocated_room: string | null;
  assigned_building: string | null;
  assigned_floor: string | null;
  created_at: string;
  user_id?: string;
};
