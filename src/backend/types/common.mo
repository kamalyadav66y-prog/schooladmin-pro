module {
  public type StudentId = Nat;
  public type TeacherId = Nat;
  public type FeeStructureId = Nat;
  public type PaymentId = Nat;
  public type AttendanceId = Nat;
  public type SiblingGroupId = Nat;
  public type Timestamp = Int;

  // Mutable counter bag — passed by reference so mixin can bump IDs
  public type Counters = {
    var nextStudentId      : Nat;
    var nextTeacherId      : Nat;
    var nextFeeStructureId : Nat;
    var nextPaymentId      : Nat;
    var nextAttendanceId   : Nat;
    var nextSiblingGroupId : Nat;
  };
};
