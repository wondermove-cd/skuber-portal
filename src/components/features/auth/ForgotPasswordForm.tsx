import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getAllUsers } from '@/lib/mock/auth';

type ForgotPasswordFormValues = {
  email: string;
};

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Validation Schema
  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .min(1, t('auth.login.emailRequired'))
      .email(t('auth.login.invalidEmail')),
  });

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError('');

    try {
      // Check if email exists in the system
      const users = getAllUsers();
      const userExists = users.some(user => user.email === data.email);

      if (!userExists) {
        setError(t('auth.forgotPassword.noAccountFound'));
        setIsLoading(false);
        return;
      }

      // Simulate API call to send verification code
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store email in sessionStorage for use in expired code page
      sessionStorage.setItem('resetPasswordEmail', data.email);

      // Navigate to verify code page
      navigate('/verify-code');
    } catch (err) {
      console.error('Failed to send verification code:', err);
      setError(t('auth.forgotPassword.failedToSend'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <Card className="w-[384px] border-border">
      <CardHeader className="space-y-1.5 text-center px-12">
        <CardTitle className="text-xl font-semibold">
          {t('auth.forgotPassword.title')}
        </CardTitle>
        <CardDescription className="text-sm">
          {t('auth.forgotPassword.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t('auth.login.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('auth.login.emailPlaceholder')}
                      className="h-9 bg-white"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center justify-center space-y-3">
              <Button
                type="submit"
                className="w-full h-9"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.forgotPassword.sending')}
                  </>
                ) : (
                  t('auth.forgotPassword.sendButton')
                )}
              </Button>

              <div className="text-sm text-center text-muted-foreground">
                {t('auth.forgotPassword.doYouWantToSignIn')}
                <br />
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-foreground hover:underline underline"
                >
                  {t('auth.forgotPassword.backToLogin')}
                </button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
