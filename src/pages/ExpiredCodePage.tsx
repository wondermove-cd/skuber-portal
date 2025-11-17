import { ExpiredCodeForm } from '@/components/features/auth/ExpiredCodeForm';
import logoSvg from '@/asset/logo.svg';

export default function ExpiredCodePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-10">
      {/* Logo */}
      <div className="flex items-center gap-2 rounded-md">
        <img src={logoSvg} alt="Skuber Partner Portal" className="h-8" />
      </div>

      {/* Expired Code Form */}
      <ExpiredCodeForm />
    </div>
  );
}
