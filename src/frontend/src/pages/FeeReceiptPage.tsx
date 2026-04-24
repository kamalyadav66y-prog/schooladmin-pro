import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReceiptData } from "@/hooks/useFeePayments";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";

const SCHOOL_NAME = "Oakwood Academy";
const SCHOOL_ADDRESS = "14 Education Lane, Knowledge City — 400001";
const SCHOOL_PHONE = "+91-22-4567-8900";

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

interface FeeLineItem {
  label: string;
  amountDue: number;
  amountPaid: number;
}

export default function FeeReceiptPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const paymentId = params.id ?? "";
  const navigate = useNavigate();
  const { data: receipt, isLoading } = useReceiptData(paymentId);

  if (isLoading) {
    return (
      <div
        data-ocid="fee_receipt.loading_state"
        className="min-h-screen bg-background flex items-center justify-center p-6"
      >
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!receipt) {
    // Render a mock receipt using the payment ID for demo purposes
    return (
      <ReceiptView
        paymentId={paymentId}
        receiptNumber={`RCP-${paymentId.padStart(4, "0")}`}
        schoolName={SCHOOL_NAME}
        schoolAddress={SCHOOL_ADDRESS}
        schoolPhone={SCHOOL_PHONE}
        studentName="Student Name"
        className="—"
        parentName="—"
        paymentDate={new Date().toISOString().split("T")[0]}
        lineItems={[{ label: "Tuition Fee", amountDue: 0, amountPaid: 0 }]}
        totalDue={0}
        totalPaid={0}
        balance={0}
        remarks=""
        onBack={() => navigate({ to: "/fee-payments" })}
      />
    );
  }

  const { payment, student, feeStructure } = receipt;

  const lineItems: FeeLineItem[] = [];
  if (feeStructure.tuitionFee > 0)
    lineItems.push({
      label: "Tuition Fee",
      amountDue: feeStructure.tuitionFee,
      amountPaid: Math.min(payment.amount, feeStructure.tuitionFee),
    });
  if (feeStructure.travelFee > 0)
    lineItems.push({
      label: "Transport Fee",
      amountDue: feeStructure.travelFee,
      amountPaid: 0,
    });
  if (feeStructure.labFee > 0)
    lineItems.push({
      label: "Lab Fee",
      amountDue: feeStructure.labFee,
      amountPaid: 0,
    });
  if (feeStructure.libraryFee > 0)
    lineItems.push({
      label: "Library Fee",
      amountDue: feeStructure.libraryFee,
      amountPaid: 0,
    });
  if (feeStructure.sportsFee > 0)
    lineItems.push({
      label: "Activity / Sports Fee",
      amountDue: feeStructure.sportsFee,
      amountPaid: 0,
    });
  if (feeStructure.otherFee > 0)
    lineItems.push({
      label: "Other Fee",
      amountDue: feeStructure.otherFee,
      amountPaid: 0,
    });
  if (lineItems.length === 0)
    lineItems.push({
      label: "Fee Payment",
      amountDue: payment.amount,
      amountPaid: payment.amount,
    });

  const totalDue = feeStructure.totalFee || payment.amount;
  const totalPaid = payment.amount;
  const balance = Math.max(0, totalDue - totalPaid);

  return (
    <ReceiptView
      paymentId={paymentId}
      receiptNumber={payment.receiptNumber}
      schoolName={SCHOOL_NAME}
      schoolAddress={SCHOOL_ADDRESS}
      schoolPhone={SCHOOL_PHONE}
      studentName={student.name || payment.studentName}
      className={student.className || payment.className}
      parentName={student.parentName}
      paymentDate={payment.paymentDate}
      lineItems={lineItems}
      totalDue={totalDue}
      totalPaid={totalPaid}
      balance={balance}
      remarks={payment.remarks}
      onBack={() => navigate({ to: "/fee-payments" })}
    />
  );
}

interface ReceiptViewProps {
  paymentId: string;
  receiptNumber: string;
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  studentName: string;
  className: string;
  parentName: string;
  paymentDate: string;
  lineItems: FeeLineItem[];
  totalDue: number;
  totalPaid: number;
  balance: number;
  remarks: string;
  onBack: () => void;
}

function ReceiptView({
  receiptNumber,
  schoolName,
  schoolAddress,
  schoolPhone,
  studentName,
  className,
  parentName,
  paymentDate,
  lineItems,
  totalDue,
  totalPaid,
  balance,
  remarks,
  onBack,
}: ReceiptViewProps) {
  return (
    <div
      data-ocid="fee_receipt.page"
      className="min-h-screen bg-muted/30 py-8 px-4"
    >
      {/* Navigation bar — hidden on print */}
      <div className="no-print max-w-2xl mx-auto mb-6 flex items-center justify-between">
        <Button
          data-ocid="fee_receipt.back_button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </Button>
        <Button
          data-ocid="fee_receipt.print_button"
          className="gap-2"
          size="sm"
          onClick={() => window.print()}
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </Button>
      </div>

      {/* Receipt content */}
      <div
        data-ocid="fee_receipt.card"
        className="max-w-2xl mx-auto bg-card border border-border rounded-xl shadow-md overflow-hidden print:shadow-none print:border-none print:rounded-none print:max-w-full"
      >
        {/* School Header */}
        <div className="bg-primary text-primary-foreground px-8 py-6 print:bg-primary">
          <h1 className="text-2xl font-display font-bold tracking-tight">
            {schoolName}
          </h1>
          <p className="text-sm mt-1 opacity-80">{schoolAddress}</p>
          <p className="text-sm opacity-80">{schoolPhone}</p>
        </div>

        {/* Receipt title + number */}
        <div className="px-8 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">
              Fee Receipt
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Official receipt for fee payment
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Receipt No.
            </p>
            <p className="font-mono font-bold text-foreground text-base">
              {receiptNumber || "—"}
            </p>
          </div>
        </div>

        {/* Student details */}
        <div className="px-8 py-5 grid grid-cols-2 gap-4 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Student Name
            </p>
            <p className="font-semibold text-foreground mt-0.5">
              {studentName || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Class
            </p>
            <p className="font-semibold text-foreground mt-0.5">
              {className || "—"}
            </p>
          </div>
          {parentName && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Parent / Guardian
              </p>
              <p className="font-semibold text-foreground mt-0.5">
                {parentName}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Payment Date
            </p>
            <p className="font-semibold text-foreground mt-0.5">
              {formatDate(paymentDate)}
            </p>
          </div>
        </div>

        {/* Fee breakdown table */}
        <div className="px-8 py-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </th>
                <th className="text-right py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Amount Due
                </th>
                <th className="text-right py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Amount Paid
                </th>
                <th className="text-right py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.label} className="border-b border-border/50">
                  <td className="py-2.5 text-foreground">{item.label}</td>
                  <td className="py-2.5 text-right font-mono text-foreground">
                    {formatCurrency(item.amountDue)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-foreground">
                    {formatCurrency(item.amountPaid)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-muted-foreground">
                    {formatCurrency(
                      Math.max(0, item.amountDue - item.amountPaid),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30">
                <td className="py-3 font-display font-bold text-foreground">
                  Total
                </td>
                <td className="py-3 text-right font-mono font-bold text-foreground">
                  {formatCurrency(totalDue)}
                </td>
                <td className="py-3 text-right font-mono font-bold text-accent">
                  {formatCurrency(totalPaid)}
                </td>
                <td className="py-3 text-right font-mono font-bold text-destructive">
                  {formatCurrency(balance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Remarks & signature */}
        {remarks && (
          <div className="px-8 pb-4 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Remarks
            </p>
            <p className="text-sm text-foreground mt-0.5">{remarks}</p>
          </div>
        )}

        <div className="px-8 py-6 border-t border-border flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              This is a computer-generated receipt and does not require a
              physical signature.
            </p>
          </div>
          <div className="text-right">
            <div className="border-t border-foreground w-32 mb-1" />
            <p className="text-xs text-muted-foreground">
              Authorised Signatory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
