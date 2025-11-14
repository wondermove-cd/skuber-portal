import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import logoSvg from '@/asset/logo.svg';

type UserSignupFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function UserSignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const invitedEmail = searchParams.get('email'); // Email from invitation
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation Schema
  const userSignupSchema = z.object({
    fullName: z.string().min(1, t('auth.signup.fullNameRequired')),
    email: z.string().min(1, t('auth.login.emailRequired')).email(t('auth.login.invalidEmail')),
    password: z.string().min(8, t('auth.login.passwordMinLength')),
    confirmPassword: z.string().min(8, t('auth.login.passwordMinLength')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.resetPassword.passwordsDontMatch'),
    path: ['confirmPassword'],
  });

  const form = useForm<UserSignupFormValues>({
    resolver: zodResolver(userSignupSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: invitedEmail || '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: UserSignupFormValues) => {
    setIsLoading(true);

    try {
      // Validate token
      if (!token) {
        toast({
          title: t('auth.signup.invalidInvitation'),
          description: t('auth.signup.invalidInvitationDesc'),
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Simulate API call to register user
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('User signup data:', {
        token,
        ...data,
      });

      toast({
        title: t('auth.signup.registrationSuccessful'),
        description: t('auth.signup.registrationSuccessfulDesc'),
      });

      // Navigate to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      console.error('Failed to register user:', err);
      toast({
        title: t('auth.signup.registrationFailed'),
        description: t('auth.signup.registrationFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-10">
      {/* Logo */}
      <div className="flex items-center gap-2 rounded-md">
        <img src={logoSvg} alt="Skuber Partner Portal" className="h-8" />
      </div>

      <Card className="w-[384px] border-border">
        <CardHeader className="space-y-2 text-center px-6">
          <CardTitle className="text-xl font-semibold leading-none">{t('auth.signup.title')}</CardTitle>
          <CardDescription className="text-sm">
            {t('auth.signup.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('auth.signup.fullNameLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.signup.fullNamePlaceholder')}
                        className="h-9 bg-white"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        disabled={true} // Email is pre-filled from invitation and disabled
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-7">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">{t('auth.login.passwordLabel')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
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

                <p className="text-xs text-muted-foreground">{t('auth.signup.passwordMinLength')}</p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-9"
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.signup.creating')}
                    </>
                  ) : (
                    t('auth.signup.createAccountButton')
                  )}
                </Button>

                <div className="text-sm text-center">
                  <span className="text-muted-foreground">{t('auth.signup.alreadyHaveAccount')} </span>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-foreground hover:underline underline"
                  >
                    {t('auth.signup.signIn')}
                  </button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="w-[384px] px-6">
        <p className="text-xs text-center text-muted-foreground leading-normal">
          {t('auth.signup.termsAndPrivacy')}
        </p>
      </div>
    </div>
  );
}
