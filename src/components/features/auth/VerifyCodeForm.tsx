import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export function VerifyCodeForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call to verify code
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, accept any 6-digit code
      // In production, this would verify against the backend
      console.log('Verification code:', code);

      // Navigate to reset password page
      navigate('/reset-password');
    } catch (err) {
      setError(t('auth.verifyCode.invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to resend code
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(t('auth.verifyCode.codeResent'));
      setValue('');
    } catch (err) {
      console.error('Failed to resend code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = () => {
    if (value.length === 6) {
      handleComplete(value);
    }
  };

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <Card className="w-[384px] border-border">
      <CardHeader className="space-y-1.5 text-center px-6">
        <CardTitle className="text-xl font-semibold">
          {t('auth.verifyCode.title')}
        </CardTitle>
        <CardDescription className="text-sm">
          {t('auth.verifyCode.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3 items-center">
            <InputOTP
              maxLength={6}
              value={value}
              onChange={(newValue) => setValue(newValue)}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-sm text-muted-foreground text-center">
              {t('auth.verifyCode.inputDescription')}
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-7">
            <Button
              onClick={handleVerify}
              className="w-full h-9"
              disabled={isLoading || value.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.verifyCode.verifying')}
                </>
              ) : (
                t('auth.verifyCode.verifyButton')
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              {t('auth.verifyCode.didntReceive')}{' '}
              <button
                type="button"
                onClick={handleResend}
                className="hover:text-foreground underline"
                disabled={isLoading}
              >
                {t('auth.verifyCode.resend')}
              </button>
              {' '}{t('auth.verifyCode.or')}{' '}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="hover:text-foreground underline"
              >
                {t('auth.verifyCode.backToLogin')}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
