export type UserPayload = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: "student" | "warden" | "admin" | "canteen manager";
  usn_id?: string | null;
  added_by_name?: string | null;
  added_by_id?: string | null;
  added_by_role?: string | null;
  status?: string;
  allocated_building?: string | null;
  allocated_floor?: string | null;
  allocated_room?: string | null;
  assigned_building?: string | null;
  assigned_floor?: string | null;
  created_at?: string;
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

export type Menu = {
  date: Date;
  type: "breakfast" | "lunch" | "snacks" | "dinner";
  items: string[];
}

export type Feedback = {
  id?: number;
  user_id: number;
  user_name: string;
  user_role: "student" | "warden" | "admin";
  category: "food_quality" | "service" | "hygiene" | "suggestion" | "complaint" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  subject: string;
  message: string;
  status: "pending" | "reviewing" | "resolved" | "rejected";
  response?: string | null;
  rating?: number | null;
  created_at?: Date;
  updated_at?: Date;
  resolved_at?: Date | null;
}

export type Announcement = {
  id?: number;
  title: string;
  message: string;
  category: "menu_update" | "service_info" | "timing_change" | "special_meal" | "general" | "urgent" | "hostel_rules" | "event" | "maintenance";
  priority: "low" | "medium" | "high";
  target_audience: "all" | "students" | "wardens" | "admins";
  active: boolean;
  expires_at?: Date | null;
  created_by_id: number;
  created_by_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export type Attendance = {
  id?: number;
  name: string;
  usn_id: number;
  allocated_building: string;
  allocated_floor: string;
  status: "present" | "absent" | "on_leave";
  timestamp?: Date;
  marked_by_id?: number;
  marked_by_name?: string;
  reason?: string | null;
}

export type AttendanceStats = {
  total_students: number;
  present: number;
  absent: number;
  on_leave: number;
  attendance_rate: number;
}
