import { LoginForm } from '@/components/features/auth/LoginForm';
import logoSvg from '@/asset/logo.svg';

export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-10">
      {/* Logo */}
      <div className="flex items-center gap-2 rounded-md">
        <img src={logoSvg} alt="Skuber Partner Portal" className="h-8" />
      </div>

      {/* Login Form */}
      <LoginForm />
    </div>
  );
}
