import List          "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";

import Common   "types/common";
import Types    "types/students-fees-attendance";
import SchoolApi "mixins/students-fees-attendance-api";

actor {
  // ── Authorization ─────────────────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Counters ──────────────────────────────────────────────────────────────
  let counters : Common.Counters = {
    var nextStudentId      = 0;
    var nextTeacherId      = 0;
    var nextFeeStructureId = 0;
    var nextPaymentId      = 0;
    var nextAttendanceId   = 0;
    var nextSiblingGroupId = 0;
  };

  // ── State ─────────────────────────────────────────────────────────────────
  let students      = List.empty<Types.Student>();
  let feeStructures = List.empty<Types.FeeStructure>();
  let feePayments   = List.empty<Types.FeePayment>();
  let teachers      = List.empty<Types.Teacher>();
  let attendances   = List.empty<Types.Attendance>();

  // ── API mixin ─────────────────────────────────────────────────────────────
  include SchoolApi(
    accessControlState,
    students,
    feeStructures,
    feePayments,
    teachers,
    attendances,
    counters,
  );
};
