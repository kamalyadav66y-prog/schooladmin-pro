import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import AttendancePage from "@/pages/AttendancePage";
import DashboardPage from "@/pages/DashboardPage";
import FeePaymentsPage from "@/pages/FeePaymentsPage";
import FeeReceiptPage from "@/pages/FeeReceiptPage";
import FeeStructuresPage from "@/pages/FeeStructuresPage";
import LoginPage from "@/pages/LoginPage";
import StudentDetailPage from "@/pages/StudentDetailPage";
import StudentEditPage from "@/pages/StudentEditPage";
import StudentsPage from "@/pages/StudentsPage";
import TeachersPage from "@/pages/TeachersPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

// Root layout route
const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return <Outlet />;
}

// Auth guard component
function ProtectedLayout() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    throw redirect({ to: "/login" });
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// Protected parent route
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: ProtectedLayout,
});

// Dashboard
const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/",
  component: DashboardPage,
});

// Students
const studentsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/students",
  component: StudentsPage,
});

// Student Detail
const studentDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/students/$id",
  component: StudentDetailPage,
});

// Student Edit
const studentEditRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/students/$id/edit",
  component: StudentEditPage,
});

// Fee Structures
const feeStructuresRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/fee-structures",
  component: FeeStructuresPage,
});

// Fee Payments
const feePaymentsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/fee-payments",
  component: FeePaymentsPage,
});

// Fee Receipt
const feeReceiptRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/fee-payments/$id/receipt",
  component: FeeReceiptPage,
});

// Teachers
const teachersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/teachers",
  component: TeachersPage,
});

// Attendance
const attendanceRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/attendance",
  component: AttendancePage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    studentsRoute,
    studentDetailRoute,
    studentEditRoute,
    feeStructuresRoute,
    feePaymentsRoute,
    feeReceiptRoute,
    teachersRoute,
    attendanceRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
