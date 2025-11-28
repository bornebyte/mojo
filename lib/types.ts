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

export type Violation = {
  id?: number;
  student_id: number;
  student_name: string;
  student_usn: string;
  student_building: string;
  student_floor: string;
  student_room: string;
  violation_type: "smoking" | "alcohol" | "property_damage" | "noise_complaint" | "unauthorized_guest" | "curfew_violation" | "mess_misbehavior" | "ragging" | "other";
  severity: "minor" | "moderate" | "severe" | "critical";
  title: string;
  description: string;
  location?: string | null;
  estimated_damage_cost?: number | null;
  evidence_photo_url?: string | null;
  status: "reported" | "under_review" | "action_taken" | "resolved" | "dismissed";
  action_taken?: string | null;
  fine_amount?: number | null;
  fine_paid?: boolean;
  reported_by_id: number;
  reported_by_name: string;
  reported_by_role: "admin" | "warden" | "student";
  reviewed_by_id?: number | null;
  reviewed_by_name?: string | null;
  incident_date: string;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
}

export type ViolationStats = {
  total_violations: number;
  by_severity: {
    minor: number;
    moderate: number;
    severe: number;
    critical: number;
  };
  by_type: {
    smoking: number;
    alcohol: number;
    property_damage: number;
    noise_complaint: number;
    unauthorized_guest: number;
    curfew_violation: number;
    mess_misbehavior: number;
    ragging: number;
    other: number;
  };
  by_status: {
    reported: number;
    under_review: number;
    action_taken: number;
    resolved: number;
    dismissed: number;
  };
  total_fines: number;
  fines_collected: number;
}
