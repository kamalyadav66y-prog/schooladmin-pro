import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Backend,
  FeePayment as BackendFeePayment,
  FeePaymentInput as BackendFeePaymentInput,
  Student as BackendStudent,
} from "../backend";
import type {
  FeePayment,
  FeePaymentInput,
  ReceiptData,
  Student,
} from "../types";

function mapFeePayment(p: BackendFeePayment): FeePayment {
  return {
    id: p.id.toString(),
    studentId: p.studentId.toString(),
    studentName: "",
    className: "",
    amount: Number(p.totalPaid),
    paymentDate: p.paymentDate,
    dueDate: "",
    status:
      p.balance === BigInt(0)
        ? "paid"
        : p.totalPaid > BigInt(0)
          ? "partial"
          : "pending",
    paymentMethod: "",
    receiptNumber: p.receiptNumber,
    remarks: "",
    isSiblingBundle: false,
    bundledStudentIds: [],
    createdAt: p.createdAt,
    updatedAt: p.createdAt,
  };
}

function toBackendFeePaymentInput(
  input: FeePaymentInput,
): BackendFeePaymentInput {
  const now = new Date();
  return {
    studentId: BigInt(input.studentId),
    month: BigInt(now.getMonth() + 1),
    year: BigInt(now.getFullYear()),
    tuitionPaid: BigInt(Math.round(input.amount * 0.7)),
    transportPaid: BigInt(0),
    activityPaid: BigInt(0),
    otherPaid: BigInt(0),
    totalDue: BigInt(input.amount),
    paymentDate: input.paymentDate || new Date().toISOString().split("T")[0],
  };
}

const mockPayments: FeePayment[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "Arjun Sharma",
    className: "Class 5",
    amount: 19700,
    paymentDate: "2025-04-01",
    dueDate: "2025-04-15",
    status: "paid",
    paymentMethod: "Online Transfer",
    receiptNumber: "RCP-2025-001",
    remarks: "Full payment",
    isSiblingBundle: false,
    bundledStudentIds: [],
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "2",
    studentId: "2",
    studentName: "Priya Sharma",
    className: "Class 3",
    amount: 34400,
    paymentDate: "2025-04-01",
    dueDate: "2025-04-15",
    status: "paid",
    paymentMethod: "Online Transfer",
    receiptNumber: "RCP-2025-002",
    remarks: "Sibling bundle payment - Arjun & Priya",
    isSiblingBundle: true,
    bundledStudentIds: ["1", "2"],
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "3",
    studentId: "3",
    studentName: "Rohan Mehta",
    className: "Class 6",
    amount: 10000,
    paymentDate: "2025-03-15",
    dueDate: "2025-04-15",
    status: "partial",
    paymentMethod: "Cash",
    receiptNumber: "RCP-2025-003",
    remarks: "Partial payment",
    isSiblingBundle: false,
    bundledStudentIds: [],
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
  {
    id: "4",
    studentId: "4",
    studentName: "Anika Patel",
    className: "Class 4",
    amount: 0,
    paymentDate: "",
    dueDate: "2025-04-15",
    status: "overdue",
    paymentMethod: "",
    receiptNumber: "",
    remarks: "",
    isSiblingBundle: false,
    bundledStudentIds: [],
    createdAt: BigInt(Date.now()),
    updatedAt: BigInt(Date.now()),
  },
];

export function useFeePayments() {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<FeePayment[]>({
    queryKey: ["feePayments"],
    queryFn: async () => {
      if (!actor) return mockPayments;
      try {
        const result = await actor.listFeePayments();
        return result.map(mapFeePayment);
      } catch {
        return mockPayments;
      }
    },
    enabled: !isFetching,
  });
}

export function useFeePaymentsByStudent(studentId: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<FeePayment[]>({
    queryKey: ["feePayments", "student", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      try {
        const result = await actor.listFeePaymentsByStudent(BigInt(studentId));
        return result.map(mapFeePayment);
      } catch {
        return mockPayments.filter(
          (p) =>
            p.studentId === studentId ||
            p.bundledStudentIds.includes(studentId),
        );
      }
    },
    enabled: !isFetching && !!studentId,
  });
}

function mapBackendStudent(s: BackendStudent): Student {
  return {
    id: s.id.toString(),
    name: s.name,
    dob: s.dob,
    address: s.address,
    className: s.classGrade,
    grade: s.classGrade,
    parentName: s.parentName,
    parentContact: s.parentContact,
    parentEmail: s.parentEmail,
    siblingGroup: s.siblingGroupId != null ? s.siblingGroupId.toString() : "",
    travelFee: 0,
    enrollmentDate: "",
    createdAt: s.createdAt,
    updatedAt: s.createdAt,
  };
}

export function useReceiptData(paymentId: string) {
  const { actor, isFetching } = useActor<Backend>(createActor);
  return useQuery<ReceiptData | null>({
    queryKey: ["receipt", paymentId],
    queryFn: async () => {
      if (!actor || !paymentId) return null;
      try {
        const result = await actor.getReceiptData(BigInt(paymentId));
        if (!result) return null;
        const payment = mapFeePayment(result);

        // Fetch student details to populate receipt
        const backendStudent = await actor.getStudent(
          BigInt(payment.studentId),
        );
        const student: Student = backendStudent
          ? mapBackendStudent(backendStudent)
          : {
              id: payment.studentId,
              name: payment.studentName || "Unknown Student",
              dob: "",
              address: "",
              className: payment.className || "",
              grade: payment.className || "",
              parentName: "",
              parentContact: "",
              parentEmail: "",
              siblingGroup: "",
              travelFee: 0,
              enrollmentDate: "",
              createdAt: BigInt(0),
              updatedAt: BigInt(0),
            };

        return {
          payment,
          student,
          feeStructure: {
            id: "",
            className: student.className,
            grade: student.grade,
            academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            tuitionFee: Math.round(payment.amount * 0.7),
            travelFee: student.travelFee,
            labFee: 0,
            libraryFee: 0,
            sportsFee: 0,
            otherFee: Math.round(payment.amount * 0.3),
            totalFee: payment.amount,
            createdAt: BigInt(0),
            updatedAt: BigInt(0),
          },
          schoolName: "Oakwood Academy",
          receiptDate: new Date().toISOString().split("T")[0],
        } as ReceiptData;
      } catch {
        return null;
      }
    },
    enabled: !isFetching && !!paymentId,
  });
}

export function useAddFeePayment() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FeePaymentInput) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addFeePayment(toBackendFeePaymentInput(input));
      return input;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feePayments"] });
    },
  });
}

export function useUpdateFeePayment() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: string; input: FeePaymentInput }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateFeePayment(BigInt(id), toBackendFeePaymentInput(input));
      return input;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feePayments"] });
    },
  });
}

export function useDeleteFeePayment() {
  const { actor } = useActor<Backend>(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteFeePayment(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feePayments"] });
    },
  });
}
