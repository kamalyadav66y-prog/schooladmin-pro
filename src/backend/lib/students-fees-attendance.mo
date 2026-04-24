import List   "mo:core/List";
import Time   "mo:core/Time";

import Common "../types/common";
import Types  "../types/students-fees-attendance";

module {

  // ── Counter helpers ───────────────────────────────────────────────────────

  public func nextStudentId(counters : Common.Counters) : Nat {
    let id = counters.nextStudentId;
    counters.nextStudentId += 1;
    id;
  };

  public func nextTeacherId(counters : Common.Counters) : Nat {
    let id = counters.nextTeacherId;
    counters.nextTeacherId += 1;
    id;
  };

  public func nextFeeStructureId(counters : Common.Counters) : Nat {
    let id = counters.nextFeeStructureId;
    counters.nextFeeStructureId += 1;
    id;
  };

  public func nextPaymentId(counters : Common.Counters) : Nat {
    let id = counters.nextPaymentId;
    counters.nextPaymentId += 1;
    id;
  };

  public func nextAttendanceId(counters : Common.Counters) : Nat {
    let id = counters.nextAttendanceId;
    counters.nextAttendanceId += 1;
    id;
  };

  public func nextSiblingGroupId(counters : Common.Counters) : Nat {
    let id = counters.nextSiblingGroupId;
    counters.nextSiblingGroupId += 1;
    id;
  };

  // ── Receipt number ────────────────────────────────────────────────────────

  public func generateReceiptNumber(paymentId : Common.PaymentId) : Text {
    "RCP-" # paymentId.toText();
  };

  // ── Student helpers ───────────────────────────────────────────────────────

  public func createStudent(
    id    : Common.StudentId,
    input : Types.StudentInput,
  ) : Types.Student {
    {
      id;
      name          = input.name;
      dob           = input.dob;
      address       = input.address;
      classGrade    = input.classGrade;
      rollNumber    = input.rollNumber;
      parentName    = input.parentName;
      parentContact = input.parentContact;
      parentEmail   = input.parentEmail;
      siblingGroupId = input.siblingGroupId;
      createdAt     = Time.now();
    };
  };

  public func updateStudent(
    existing : Types.Student,
    input    : Types.StudentInput,
  ) : Types.Student {
    {
      existing with
      name          = input.name;
      dob           = input.dob;
      address       = input.address;
      classGrade    = input.classGrade;
      rollNumber    = input.rollNumber;
      parentName    = input.parentName;
      parentContact = input.parentContact;
      parentEmail   = input.parentEmail;
      siblingGroupId = input.siblingGroupId;
    };
  };

  public func matchesSearch(student : Types.Student, term : Text) : Bool {
    let lower = term.toLower();
    student.name.toLower().contains(#text lower)
      or student.rollNumber.toLower().contains(#text lower)
      or student.parentContact.toLower().contains(#text lower)
      or student.parentName.toLower().contains(#text lower);
  };

  // ── Fee structure helpers ─────────────────────────────────────────────────

  public func createFeeStructure(
    id    : Common.FeeStructureId,
    input : Types.FeeStructureInput,
  ) : Types.FeeStructure {
    {
      id;
      classGrade    = input.classGrade;
      tuitionFee    = input.tuitionFee;
      transportFee  = input.transportFee;
      activityFee   = input.activityFee;
      otherFee      = input.otherFee;
      effectiveFrom = input.effectiveFrom;
    };
  };

  public func updateFeeStructure(
    existing : Types.FeeStructure,
    input    : Types.FeeStructureInput,
  ) : Types.FeeStructure {
    {
      existing with
      classGrade    = input.classGrade;
      tuitionFee    = input.tuitionFee;
      transportFee  = input.transportFee;
      activityFee   = input.activityFee;
      otherFee      = input.otherFee;
      effectiveFrom = input.effectiveFrom;
    };
  };

  public func feeStructureForClass(
    feeStructures : List.List<Types.FeeStructure>,
    classGrade    : Text,
  ) : ?Types.FeeStructure {
    feeStructures.find(func(fs) { fs.classGrade == classGrade });
  };

  // ── Fee payment helpers ───────────────────────────────────────────────────

  public func createFeePayment(
    id    : Common.PaymentId,
    input : Types.FeePaymentInput,
  ) : Types.FeePayment {
    let totalPaid = input.tuitionPaid + input.transportPaid + input.activityPaid + input.otherPaid;
    let balanceInt = input.totalDue.toInt() - totalPaid.toInt();
    let balance : Nat = if (balanceInt > 0) { balanceInt.toNat() } else { 0 };
    {
      id;
      studentId     = input.studentId;
      month         = input.month;
      year          = input.year;
      tuitionPaid   = input.tuitionPaid;
      transportPaid = input.transportPaid;
      activityPaid  = input.activityPaid;
      otherPaid     = input.otherPaid;
      totalDue      = input.totalDue;
      totalPaid;
      balance;
      paymentDate   = input.paymentDate;
      receiptNumber = generateReceiptNumber(id);
      createdAt     = Time.now();
    };
  };

  public func updateFeePayment(
    existing : Types.FeePayment,
    input    : Types.FeePaymentInput,
  ) : Types.FeePayment {
    let totalPaid = input.tuitionPaid + input.transportPaid + input.activityPaid + input.otherPaid;
    let balanceInt2 = input.totalDue.toInt() - totalPaid.toInt();
    let balance : Nat = if (balanceInt2 > 0) { balanceInt2.toNat() } else { 0 };
    {
      existing with
      studentId     = input.studentId;
      month         = input.month;
      year          = input.year;
      tuitionPaid   = input.tuitionPaid;
      transportPaid = input.transportPaid;
      activityPaid  = input.activityPaid;
      otherPaid     = input.otherPaid;
      totalDue      = input.totalDue;
      totalPaid;
      balance;
      paymentDate   = input.paymentDate;
    };
  };

  public func computeSiblingFees(
    students      : List.List<Types.Student>,
    feeStructures : List.List<Types.FeeStructure>,
    siblingGroupId: Common.SiblingGroupId,
  ) : Nat {
    let siblings = students.filter(func(s) {
      switch (s.siblingGroupId) {
        case (?gid) { gid == siblingGroupId };
        case null   { false };
      }
    });
    siblings.foldLeft<Nat, Types.Student>(
      0,
      func(acc, s) {
        switch (feeStructureForClass(feeStructures, s.classGrade)) {
          case (?fs) {
            acc + fs.tuitionFee + fs.transportFee + fs.activityFee + fs.otherFee;
          };
          case null { acc };
        };
      },
    );
  };

  // ── Teacher helpers ───────────────────────────────────────────────────────

  public func createTeacher(
    id    : Common.TeacherId,
    input : Types.TeacherInput,
  ) : Types.Teacher {
    {
      id;
      name          = input.name;
      subject       = input.subject;
      classAssigned = input.classAssigned;
      createdAt     = Time.now();
    };
  };

  public func updateTeacher(
    existing : Types.Teacher,
    input    : Types.TeacherInput,
  ) : Types.Teacher {
    {
      existing with
      name          = input.name;
      subject       = input.subject;
      classAssigned = input.classAssigned;
    };
  };

  // ── Attendance helpers ────────────────────────────────────────────────────

  public func createAttendance(
    id    : Common.AttendanceId,
    input : Types.AttendanceInput,
  ) : Types.Attendance {
    {
      id;
      teacherId = input.teacherId;
      date      = input.date;
      status    = input.status;
      notes     = input.notes;
      createdAt = Time.now();
    };
  };

  public func updateAttendance(
    existing : Types.Attendance,
    input    : Types.AttendanceInput,
  ) : Types.Attendance {
    {
      existing with
      teacherId = input.teacherId;
      date      = input.date;
      status    = input.status;
      notes     = input.notes;
    };
  };
};
