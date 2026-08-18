import { Colors } from "@/constants/theme";

export type AttendancePalette = (typeof Colors)[keyof typeof Colors];

export type CheckInMethod = "QR Code" | "Manual Code" | "Both";
export type AttendanceStatus = "Present" | "Late" | "Excused" | "Absent";

export type LiveAttendanceRecord = {
  id: string;
  studentName: string;
  checkInTime: string;
  method: "QR Code" | "Manual Code";
  status: "Present" | "Late";
};

export type ManualStudent = {
  id: string;
  name: string;
  email?: string | null;
};

export type LiveSessionInfo = {
  id: string;
  classId?: string;
  className: string;
  title?: string | null;
  status: "Live" | "Ended";
  manualCode: string;
  qrPayload: string;
  presentCount: number;
  totalStudents: number;
  startTime: string;
  endTime: string;
  radiusMetres: number;
  checkInMethod: CheckInMethod;
  locationEnabled: boolean;
  students: ManualStudent[];
  attendance: LiveAttendanceRecord[];
};
