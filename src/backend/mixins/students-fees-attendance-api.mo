import List          "mo:core/List";
import Runtime       "mo:core/Runtime";

import AccessControl "mo:caffeineai-authorization/access-control";
import Common        "../types/common";
import Types         "../types/students-fees-attendance";
import Lib           "../lib/students-fees-attendance";

mixin (
  accessControlState : AccessControl.AccessControlState,
  students           : List.List<Types.Student>,
  feeStructures      : List.List<Types.FeeStructure>,
  feePayments        : List.List<Types.FeePayment>,
  teachers           : List.List<Types.Teacher>,
  attendances        : List.List<Types.Attendance>,
  counters           : Common.Counters,
) {

  // ── Admin guard ───────────────────────────────────────────────────────────

  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin access required");
    };
  };

  // ── Students ──────────────────────────────────────────────────────────────

  public query ({ caller }) func listStudents() : async [Types.Student] {
    students.toArray();
  };

  public query ({ caller }) func listStudentsByClass(classGrade : Text) : async [Types.Student] {
    students.filter(func(s) { s.classGrade == classGrade }).toArray();
  };

  public query ({ caller }) func searchStudents(term : Text) : async [Types.Student] {
    if (term == "") { return students.toArray() };
    students.filter(func(s) { Lib.matchesSearch(s, term) }).toArray();
  };

  public query ({ caller }) func getStudent(id : Common.StudentId) : async ?Types.Student {
    students.find(func(s) { s.id == id });
  };

  public shared ({ caller }) func addStudent(input : Types.StudentInput) : async Common.StudentId {
    requireAdmin(caller);
    let id = Lib.nextStudentId(counters);
    students.add(Lib.createStudent(id, input));
    id;
  };

  public shared ({ caller }) func updateStudent(
    id    : Common.StudentId,
    input : Types.StudentInput,
  ) : async Bool {
    requireAdmin(caller);
    var found = false;
    students.mapInPlace(func(s) {
      if (s.id == id) { found := true; Lib.updateStudent(s, input) } else { s }
    });
    found;
  };

  public shared ({ caller }) func deleteStudent(id : Common.StudentId) : async Bool {
    requireAdmin(caller);
    let before = students.size();
    let kept = students.filter(func(s) { s.id != id });
    students.clear();
    students.append(kept);
    students.size() < before;
  };

  // ── Sibling groups ────────────────────────────────────────────────────────

  public query ({ caller }) func listStudentsByParentContact(contact : Text) : async [Types.Student] {
    students.filter(func(s) { s.parentContact == contact }).toArray();
  };

  public query ({ caller }) func listStudentsBySiblingGroup(
    siblingGroupId : Common.SiblingGroupId,
  ) : async [Types.Student] {
    students.filter(func(s) {
      switch (s.siblingGroupId) {
        case (?gid) { gid == siblingGroupId };
        case null   { false };
      }
    }).toArray();
  };

  public query ({ caller }) func getSiblingGroupFeeTotal(
    siblingGroupId : Common.SiblingGroupId,
    _month         : Nat,
    _year          : Nat,
  ) : async Nat {
    Lib.computeSiblingFees(students, feeStructures, siblingGroupId);
  };

  // ── Fee structures ────────────────────────────────────────────────────────

  public query ({ caller }) func listFeeStructures() : async [Types.FeeStructure] {
    feeStructures.toArray();
  };

  public query ({ caller }) func getFeeStructure(id : Common.FeeStructureId) : async ?Types.FeeStructure {
    feeStructures.find(func(fs) { fs.id == id });
  };

  public query ({ caller }) func getFeeStructureByClass(classGrade : Text) : async ?Types.FeeStructure {
    Lib.feeStructureForClass(feeStructures, classGrade);
  };

  public shared ({ caller }) func addFeeStructure(
    input : Types.FeeStructureInput,
  ) : async Common.FeeStructureId {
    requireAdmin(caller);
    let id = Lib.nextFeeStructureId(counters);
    feeStructures.add(Lib.createFeeStructure(id, input));
    id;
  };

  public shared ({ caller }) func updateFeeStructure(
    id    : Common.FeeStructureId,
    input : Types.FeeStructureInput,
  ) : async Bool {
    requireAdmin(caller);
    var found = false;
    feeStructures.mapInPlace(func(fs) {
      if (fs.id == id) { found := true; Lib.updateFeeStructure(fs, input) } else { fs }
    });
    found;
  };

  public shared ({ caller }) func deleteFeeStructure(id : Common.FeeStructureId) : async Bool {
    requireAdmin(caller);
    let before = feeStructures.size();
    let kept = feeStructures.filter(func(fs) { fs.id != id });
    feeStructures.clear();
    feeStructures.append(kept);
    feeStructures.size() < before;
  };

  // ── Fee payments ──────────────────────────────────────────────────────────

  public query ({ caller }) func listFeePayments() : async [Types.FeePayment] {
    feePayments.toArray();
  };

  public query ({ caller }) func listFeePaymentsByStudent(
    studentId : Common.StudentId,
  ) : async [Types.FeePayment] {
    feePayments.filter(func(p) { p.studentId == studentId }).toArray();
  };

  public query ({ caller }) func getFeePayment(id : Common.PaymentId) : async ?Types.FeePayment {
    feePayments.find(func(p) { p.id == id });
  };

  public query ({ caller }) func getReceiptData(id : Common.PaymentId) : async ?Types.FeePayment {
    feePayments.find(func(p) { p.id == id });
  };

  public shared ({ caller }) func addFeePayment(
    input : Types.FeePaymentInput,
  ) : async Common.PaymentId {
    requireAdmin(caller);
    let id = Lib.nextPaymentId(counters);
    feePayments.add(Lib.createFeePayment(id, input));
    id;
  };

  public shared ({ caller }) func updateFeePayment(
    id    : Common.PaymentId,
    input : Types.FeePaymentInput,
  ) : async Bool {
    requireAdmin(caller);
    var found = false;
    feePayments.mapInPlace(func(p) {
      if (p.id == id) { found := true; Lib.updateFeePayment(p, input) } else { p }
    });
    found;
  };

  public shared ({ caller }) func deleteFeePayment(id : Common.PaymentId) : async Bool {
    requireAdmin(caller);
    let before = feePayments.size();
    let kept = feePayments.filter(func(p) { p.id != id });
    feePayments.clear();
    feePayments.append(kept);
    feePayments.size() < before;
  };

  // ── Teachers ──────────────────────────────────────────────────────────────

  public query ({ caller }) func listTeachers() : async [Types.Teacher] {
    teachers.toArray();
  };

  public query ({ caller }) func getTeacher(id : Common.TeacherId) : async ?Types.Teacher {
    teachers.find(func(t) { t.id == id });
  };

  public shared ({ caller }) func addTeacher(input : Types.TeacherInput) : async Common.TeacherId {
    requireAdmin(caller);
    let id = Lib.nextTeacherId(counters);
    teachers.add(Lib.createTeacher(id, input));
    id;
  };

  public shared ({ caller }) func updateTeacher(
    id    : Common.TeacherId,
    input : Types.TeacherInput,
  ) : async Bool {
    requireAdmin(caller);
    var found = false;
    teachers.mapInPlace(func(t) {
      if (t.id == id) { found := true; Lib.updateTeacher(t, input) } else { t }
    });
    found;
  };

  public shared ({ caller }) func deleteTeacher(id : Common.TeacherId) : async Bool {
    requireAdmin(caller);
    let before = teachers.size();
    let kept = teachers.filter(func(t) { t.id != id });
    teachers.clear();
    teachers.append(kept);
    teachers.size() < before;
  };

  // ── Attendance ────────────────────────────────────────────────────────────

  public query ({ caller }) func listAttendances() : async [Types.Attendance] {
    attendances.toArray();
  };

  public query ({ caller }) func listAttendancesByTeacher(
    teacherId : Common.TeacherId,
  ) : async [Types.Attendance] {
    attendances.filter(func(a) { a.teacherId == teacherId }).toArray();
  };

  public query ({ caller }) func listAttendancesByDate(date : Text) : async [Types.Attendance] {
    attendances.filter(func(a) { a.date == date }).toArray();
  };

  public query ({ caller }) func getAttendance(id : Common.AttendanceId) : async ?Types.Attendance {
    attendances.find(func(a) { a.id == id });
  };

  public shared ({ caller }) func addAttendance(
    input : Types.AttendanceInput,
  ) : async Common.AttendanceId {
    requireAdmin(caller);
    let id = Lib.nextAttendanceId(counters);
    attendances.add(Lib.createAttendance(id, input));
    id;
  };

  public shared ({ caller }) func updateAttendance(
    id    : Common.AttendanceId,
    input : Types.AttendanceInput,
  ) : async Bool {
    requireAdmin(caller);
    var found = false;
    attendances.mapInPlace(func(a) {
      if (a.id == id) { found := true; Lib.updateAttendance(a, input) } else { a }
    });
    found;
  };

  public shared ({ caller }) func deleteAttendance(id : Common.AttendanceId) : async Bool {
    requireAdmin(caller);
    let before = attendances.size();
    let kept = attendances.filter(func(a) { a.id != id });
    attendances.clear();
    attendances.append(kept);
    attendances.size() < before;
  };
};
