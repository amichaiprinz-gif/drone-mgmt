export type DroneModel = "avata" | "ivo" | "mavic3pro" | "air3" | "mini4" | "other";
export type DroneType = "military" | "civilian";
export type DroneStatus = "active" | "maintenance" | "inactive";
export type BatteryStatus = "charged" | "empty" | "storage" | "damaged";
export type MissionType = "recon" | "training" | "emergency" | "other";
export type FlightMode = "normal" | "emergency";
export type ProcedureType = "preflight_normal" | "preflight_emergency" | "landing" | "postflight";

export interface Drone {
  id: string;
  name: string;
  model: DroneModel;
  type: DroneType;
  status: DroneStatus;
  serial_number: string | null;
  notes: string | null;
  last_inspection_date: string | null;
  created_at: string;
}

export interface Battery {
  id: string;
  drone_model: string;
  label: string;
  status: BatteryStatus;
  last_charged_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface Pilot {
  id: string;
  name: string;
  role: string | null;
  certifications: string[];
  exam_passed: boolean;
  last_flight_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ChecklistItem {
  order: number;
  category: string;
  text: string;
  checked?: boolean;
}

export interface ProcedureStep {
  order: number;
  category: string;
  text: string;
}

export interface Procedure {
  id: string;
  drone_model: string;
  procedure_type: ProcedureType;
  title: string;
  steps: ProcedureStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Flight {
  id: string;
  drone_id: string | null;
  pilot_id: string | null;
  observer_id: string | null;
  flight_date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  area: string | null;
  mission_type: MissionType | null;
  flight_mode: FlightMode;
  checklist_completed: ChecklistItem[];
  notes: string | null;
  issues: string | null;
  created_at: string;
  drone?: Drone;
  pilot?: Pilot;
  observer?: Pilot;
}
