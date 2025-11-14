import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
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

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation Schema
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t('auth.login.emailRequired'))
      .email(t('auth.login.invalidEmail')),
    password: z
      .string()
      .min(8, t('auth.login.passwordMinLength')),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.login.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  return (
    <Card className="w-[384px] border-border">
      <CardHeader className="space-y-1.5 text-center px-12">
        <CardTitle className="text-xl font-semibold">
          {t('auth.login.title')}
        </CardTitle>
        <CardDescription className="text-sm">
          {t('auth.login.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            <div className="space-y-7">
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

              <div className="relative">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium">
                          {t('auth.login.passwordLabel')}
                        </FormLabel>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-foreground hover:underline"
                        >
                          {t('auth.login.forgotPassword')}
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('auth.login.passwordPlaceholder')}
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
              </div>
            </div>

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
                    {t('auth.login.loggingIn')}
                  </>
                ) : (
                  t('auth.login.loginButton')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
