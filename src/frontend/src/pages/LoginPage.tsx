import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { Lock, School, Shield } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, isInitializing, isLoggingIn, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      data-ocid="login.page"
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-md">
              <School className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Oakwood Academy
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              School Management System
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-6" />

          {/* Login section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/60 border border-border">
              <Lock className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Admin Access Required
                </p>
                <p className="text-xs text-muted-foreground">
                  Sign in with Internet Identity to continue
                </p>
              </div>
            </div>

            <Button
              data-ocid="login.submit_button"
              className="w-full h-11 gap-2 text-base font-medium"
              onClick={login}
              disabled={isInitializing || isLoggingIn}
            >
              {isInitializing ? (
                "Initializing..."
              ) : isLoggingIn ? (
                "Signing in..."
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Sign In with Internet Identity
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure decentralized authentication via Internet Computer
            </p>
          </div>
        </div>

        {/* Features note */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-center">
          {[
            { label: "Student Records" },
            { label: "Fee Management" },
            { label: "Teacher Attendance" },
            { label: "Print Receipts" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-card border border-border rounded-lg py-2.5 px-3"
            >
              <p className="text-xs text-muted-foreground font-medium">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
