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
import { useToast } from '@/hooks/use-toast';
import { getAllUsers } from '@/lib/mock/auth';

export function ExpiredCodeForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendNewCode = async () => {
    setIsLoading(true);

    try {
      // Get email from sessionStorage (stored during forgot password flow)
      const email = sessionStorage.getItem('resetPasswordEmail');

      if (!email) {
        // If no email found, redirect to forgot password page
        navigate('/forgot-password');
        return;
      }

      // Check if email exists in the system
      const users = getAllUsers();
      const userExists = users.some(user => user.email === email);

      if (!userExists) {
        toast({
          title: t('auth.forgotPassword.noAccountFound'),
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Simulate API call to send new verification code
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: t('auth.expiredCode.newCodeSent'),
        description: t('auth.expiredCode.newCodeSentDesc'),
      });

      // Navigate to verify code page
      navigate('/verify-code');
    } catch (err) {
      console.error('Failed to send new verification code:', err);
      toast({
        title: t('auth.forgotPassword.failedToSend'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear session storage
    sessionStorage.removeItem('resetPasswordEmail');
    navigate('/login');
  };

  return (
    <Card className="w-[384px] border-border">
      <CardHeader className="space-y-1.5 text-center px-6">
        <CardTitle className="text-xl font-semibold">
          {t('auth.expiredCode.title')}
        </CardTitle>
        <CardDescription className="text-sm">
          {t('auth.expiredCode.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSendNewCode}
            className="w-full h-9"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.forgotPassword.sending')}
              </>
            ) : (
              t('auth.expiredCode.sendNewCode')
            )}
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            {t('auth.expiredCode.wantToSignIn')}
            <br />
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-foreground hover:underline underline"
            >
              {t('auth.expiredCode.backToLogin')}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
