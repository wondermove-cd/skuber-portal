import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation Schema
  const resetPasswordSchema = z.object({
    password: z
      .string()
      .min(8, t('auth.login.passwordMinLength')),
    confirmPassword: z
      .string()
      .min(8, t('auth.login.passwordMinLength')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.resetPassword.passwordsDontMatch'),
    path: ['confirmPassword'],
  });

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);

    try {
      // Simulate API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('New password set:', data.password);

      // Show success toast message
      toast({
        title: t('auth.resetPassword.resetSuccessful'),
        description: t('auth.resetPassword.resetSuccessfulDesc'),
      });

      // Navigate to login after short delay
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      console.error('Failed to reset password:', err);
      toast({
        title: t('auth.resetPassword.resetFailed'),
        description: t('auth.resetPassword.resetFailedDesc'),
        variant: 'destructive',
      });
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
      <CardHeader className="space-y-2 text-center px-6">
        <CardTitle className="text-xl font-semibold leading-none">
          {t('auth.resetPassword.title')}
        </CardTitle>
        <CardDescription className="text-sm">
          {t('auth.resetPassword.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            <div className="space-y-7">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('auth.resetPassword.newPasswordLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                          className="h-9 bg-white pr-10"
                          disabled={isLoading}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-0 h-9 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('auth.resetPassword.confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                          className="h-9 bg-white pr-10"
                          disabled={isLoading}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-0 top-0 h-9 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full h-9"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.resetPassword.applying')}
                  </>
                ) : (
                  t('auth.resetPassword.applyButton')
                )}
              </Button>

              <div className="text-sm text-center">
                <span className="text-muted-foreground">{t('auth.forgotPassword.doYouWantToSignIn')} </span>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-muted-foreground hover:text-foreground underline"
                >
                  {t('auth.resetPassword.backToLogin')}
                </button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
