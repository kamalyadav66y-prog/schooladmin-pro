// Shared types for School Management System
// These mirror the backend Motoko types

export type PaymentStatus = "paid" | "pending" | "overdue" | "partial";
export type AttendanceStatus = "present" | "absent" | "late" | "halfDay";
export type FeeCategory =
  | "tuition"
  | "travel"
  | "lab"
  | "library"
  | "sports"
  | "other";

export interface Student {
  id: string;
  name: string;
  dob: string;
  address: string;
  className: string;
  grade: string;
  parentName: string;
  parentContact: string;
  parentEmail: string;
  siblingGroup: string; // shared group id for siblings
  travelFee: number;
  enrollmentDate: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface FeeStructure {
  id: string;
  className: string;
  grade: string;
  academicYear: string;
  tuitionFee: number;
  travelFee: number;
  labFee: number;
  libraryFee: number;
  sportsFee: number;
  otherFee: number;
  totalFee: number;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface FeePayment {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod: string;
  receiptNumber: string;
  remarks: string;
  isSiblingBundle: boolean;
  bundledStudentIds: string[];
  createdAt: bigint;
  updatedAt: bigint;
}

export interface ReceiptData {
  payment: FeePayment;
  student: Student;
  feeStructure: FeeStructure;
  schoolName: string;
  receiptDate: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  className: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Attendance {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  remarks: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface UserProfile {
  name: string;
}

// Form input types (without auto-generated fields)
export type StudentInput = Omit<Student, "id" | "createdAt" | "updatedAt">;
export type FeeStructureInput = Omit<
  FeeStructure,
  "id" | "createdAt" | "updatedAt"
>;
export type FeePaymentInput = Omit<
  FeePayment,
  "id" | "createdAt" | "updatedAt"
>;
export type TeacherInput = Omit<Teacher, "id" | "createdAt" | "updatedAt">;
export type AttendanceInput = Omit<
  Attendance,
  "id" | "createdAt" | "updatedAt"
>;
