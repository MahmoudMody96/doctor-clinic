export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface ServiceDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface BookingDTO {
  id: number;
  refCode: string;
  patientName: string;
  phone: string;
  service: Pick<ServiceDTO, "id" | "name" | "price" | "durationMin" | "icon">;
  date: string;
  time: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
}

export interface ScheduleRuleDTO {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  isActive: boolean;
}

export interface BlockedDateDTO {
  id: number;
  date: string;
  reason: string | null;
}

export type ContentMap = Record<string, string>;

export interface AvailabilityResponse {
  slots: string[];
  offDay: boolean;
  blocked: boolean;
  past: boolean;
}

export interface StatsResponse {
  totals: Record<BookingStatus, number>;
  todayCount: number;
  weekCount: number;
  totalActive: number;
  revenue: number;
  last14: { date: string; count: number }[];
  topServices: { name: string; count: number }[];
  upcoming: BookingDTO[];
}
