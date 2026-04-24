import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TeacherInput {
    subject: string;
    name: string;
    classAssigned: string;
}
export type Timestamp = bigint;
export interface Attendance {
    id: AttendanceId;
    status: AttendanceStatus;
    date: string;
    createdAt: Timestamp;
    notes: string;
    teacherId: TeacherId;
}
export interface StudentInput {
    dob: string;
    parentEmail: string;
    parentContact: string;
    name: string;
    siblingGroupId?: SiblingGroupId;
    rollNumber: string;
    address: string;
    classGrade: string;
    parentName: string;
}
export type FeeStructureId = bigint;
export interface Teacher {
    id: TeacherId;
    subject: string;
    name: string;
    createdAt: Timestamp;
    classAssigned: string;
}
export type StudentId = bigint;
export type TeacherId = bigint;
export interface FeeStructure {
    id: FeeStructureId;
    tuitionFee: bigint;
    activityFee: bigint;
    otherFee: bigint;
    classGrade: string;
    transportFee: bigint;
    effectiveFrom: string;
}
export type SiblingGroupId = bigint;
export interface FeePayment {
    id: PaymentId;
    month: bigint;
    activityPaid: bigint;
    studentId: StudentId;
    balance: bigint;
    createdAt: Timestamp;
    year: bigint;
    totalPaid: bigint;
    totalDue: bigint;
    otherPaid: bigint;
    paymentDate: string;
    tuitionPaid: bigint;
    transportPaid: bigint;
    receiptNumber: string;
}
export type AttendanceId = bigint;
export type PaymentId = bigint;
export interface AttendanceInput {
    status: AttendanceStatus;
    date: string;
    notes: string;
    teacherId: TeacherId;
}
export interface FeeStructureInput {
    tuitionFee: bigint;
    activityFee: bigint;
    otherFee: bigint;
    classGrade: string;
    transportFee: bigint;
    effectiveFrom: string;
}
export interface FeePaymentInput {
    month: bigint;
    activityPaid: bigint;
    studentId: StudentId;
    year: bigint;
    totalDue: bigint;
    otherPaid: bigint;
    paymentDate: string;
    tuitionPaid: bigint;
    transportPaid: bigint;
}
export interface Student {
    id: StudentId;
    dob: string;
    parentEmail: string;
    parentContact: string;
    name: string;
    createdAt: Timestamp;
    siblingGroupId?: SiblingGroupId;
    rollNumber: string;
    address: string;
    classGrade: string;
    parentName: string;
}
export enum AttendanceStatus {
    present = "present",
    absent = "absent"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAttendance(input: AttendanceInput): Promise<AttendanceId>;
    addFeePayment(input: FeePaymentInput): Promise<PaymentId>;
    addFeeStructure(input: FeeStructureInput): Promise<FeeStructureId>;
    addStudent(input: StudentInput): Promise<StudentId>;
    addTeacher(input: TeacherInput): Promise<TeacherId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAttendance(id: AttendanceId): Promise<boolean>;
    deleteFeePayment(id: PaymentId): Promise<boolean>;
    deleteFeeStructure(id: FeeStructureId): Promise<boolean>;
    deleteStudent(id: StudentId): Promise<boolean>;
    deleteTeacher(id: TeacherId): Promise<boolean>;
    getAttendance(id: AttendanceId): Promise<Attendance | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeePayment(id: PaymentId): Promise<FeePayment | null>;
    getFeeStructure(id: FeeStructureId): Promise<FeeStructure | null>;
    getFeeStructureByClass(classGrade: string): Promise<FeeStructure | null>;
    getReceiptData(id: PaymentId): Promise<FeePayment | null>;
    getSiblingGroupFeeTotal(siblingGroupId: SiblingGroupId, _month: bigint, _year: bigint): Promise<bigint>;
    getStudent(id: StudentId): Promise<Student | null>;
    getTeacher(id: TeacherId): Promise<Teacher | null>;
    isCallerAdmin(): Promise<boolean>;
    listAttendances(): Promise<Array<Attendance>>;
    listAttendancesByDate(date: string): Promise<Array<Attendance>>;
    listAttendancesByTeacher(teacherId: TeacherId): Promise<Array<Attendance>>;
    listFeePayments(): Promise<Array<FeePayment>>;
    listFeePaymentsByStudent(studentId: StudentId): Promise<Array<FeePayment>>;
    listFeeStructures(): Promise<Array<FeeStructure>>;
    listStudents(): Promise<Array<Student>>;
    listStudentsByClass(classGrade: string): Promise<Array<Student>>;
    listStudentsByParentContact(contact: string): Promise<Array<Student>>;
    listStudentsBySiblingGroup(siblingGroupId: SiblingGroupId): Promise<Array<Student>>;
    listTeachers(): Promise<Array<Teacher>>;
    searchStudents(term: string): Promise<Array<Student>>;
    updateAttendance(id: AttendanceId, input: AttendanceInput): Promise<boolean>;
    updateFeePayment(id: PaymentId, input: FeePaymentInput): Promise<boolean>;
    updateFeeStructure(id: FeeStructureId, input: FeeStructureInput): Promise<boolean>;
    updateStudent(id: StudentId, input: StudentInput): Promise<boolean>;
    updateTeacher(id: TeacherId, input: TeacherInput): Promise<boolean>;
}
