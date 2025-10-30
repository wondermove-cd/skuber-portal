import { LoginForm } from '@/components/features/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-10">
      {/* Logo */}
      <div className="flex items-center gap-2 rounded-md">
        <div className="flex items-center gap-2">
          {/* Wondermove Logo */}
          <div className="flex h-8 items-center justify-center overflow-clip">
            <div className="text-foreground text-lg font-semibold">
              Skuber
            </div>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-50/20" />

          {/* Partner Portal Text */}
          <div className="text-foreground text-sm">Partner Portal</div>
        </div>
      </div>

      {/* Login Form */}
      <LoginForm />
    </div>
  );
}
