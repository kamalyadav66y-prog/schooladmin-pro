import Common "common";

module {
  // ── Student ──────────────────────────────────────────────────────────────
  public type Student = {
    id            : Common.StudentId;
    name          : Text;
    dob           : Text;           // ISO date YYYY-MM-DD
    address       : Text;
    classGrade    : Text;
    rollNumber    : Text;
    parentName    : Text;
    parentContact : Text;
    parentEmail   : Text;
    siblingGroupId: ?Common.SiblingGroupId;
    createdAt     : Common.Timestamp;
  };

  public type StudentInput = {
    name          : Text;
    dob           : Text;
    address       : Text;
    classGrade    : Text;
    rollNumber    : Text;
    parentName    : Text;
    parentContact : Text;
    parentEmail   : Text;
    siblingGroupId: ?Common.SiblingGroupId;
  };

  // ── Fee Structure ─────────────────────────────────────────────────────────
  public type FeeStructure = {
    id            : Common.FeeStructureId;
    classGrade    : Text;
    tuitionFee    : Nat;
    transportFee  : Nat;
    activityFee   : Nat;
    otherFee      : Nat;
    effectiveFrom : Text;           // ISO date YYYY-MM-DD
  };

  public type FeeStructureInput = {
    classGrade    : Text;
    tuitionFee    : Nat;
    transportFee  : Nat;
    activityFee   : Nat;
    otherFee      : Nat;
    effectiveFrom : Text;
  };

  // ── Fee Payment ───────────────────────────────────────────────────────────
  public type FeePayment = {
    id             : Common.PaymentId;
    studentId      : Common.StudentId;
    month          : Nat;           // 1-12
    year           : Nat;
    tuitionPaid    : Nat;
    transportPaid  : Nat;
    activityPaid   : Nat;
    otherPaid      : Nat;
    totalDue       : Nat;
    totalPaid      : Nat;
    balance        : Nat;
    paymentDate    : Text;          // ISO date YYYY-MM-DD
    receiptNumber  : Text;
    createdAt      : Common.Timestamp;
  };

  public type FeePaymentInput = {
    studentId      : Common.StudentId;
    month          : Nat;
    year           : Nat;
    tuitionPaid    : Nat;
    transportPaid  : Nat;
    activityPaid   : Nat;
    otherPaid      : Nat;
    totalDue       : Nat;
    paymentDate    : Text;
  };

  // ── Teacher ───────────────────────────────────────────────────────────────
  public type Teacher = {
    id            : Common.TeacherId;
    name          : Text;
    subject       : Text;
    classAssigned : Text;
    createdAt     : Common.Timestamp;
  };

  public type TeacherInput = {
    name          : Text;
    subject       : Text;
    classAssigned : Text;
  };

  // ── Attendance ────────────────────────────────────────────────────────────
  public type AttendanceStatus = { #present; #absent };

  public type Attendance = {
    id        : Common.AttendanceId;
    teacherId : Common.TeacherId;
    date      : Text;               // YYYY-MM-DD
    status    : AttendanceStatus;
    notes     : Text;
    createdAt : Common.Timestamp;
  };

  public type AttendanceInput = {
    teacherId : Common.TeacherId;
    date      : Text;
    status    : AttendanceStatus;
    notes     : Text;
  };

  // ── Sibling / parent bundle ───────────────────────────────────────────────
  public type SiblingGroup = {
    id             : Common.SiblingGroupId;
    parentContact  : Text;
    studentIds     : [Common.StudentId];
  };
};
