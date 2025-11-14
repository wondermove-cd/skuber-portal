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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import logoSvg from '@/asset/logo.svg';

// Business Registration Number validation by country
const validateBusinessRegNo = (country: string, regNo: string): boolean => {
  const patterns: Record<string, RegExp> = {
    'South Korea': /^\d{3}-\d{2}-\d{5}$/,  // 123-45-67890
    'United States': /^\d{2}-\d{7}$/,      // 12-3456789 (EIN)
    'Japan': /^\d{13}$/,                   // 1234567890123
    'China': /^\d{18}$/,                   // 18 digits
    'Singapore': /^\d{9}[A-Z]$/,           // 123456789A (UEN)
  };

  const pattern = patterns[country];
  if (!pattern) return true; // Allow if pattern not defined
  return pattern.test(regNo);
};

type ResellerSignupFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  contactPerson: string;
  country: string;
  businessRegNo: string;
};

export default function ResellerSignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation Schema
  const resellerSignupSchema = z.object({
    email: z.string().min(1, t('auth.login.emailRequired')).email(t('auth.login.invalidEmail')),
    password: z.string().min(8, t('auth.login.passwordMinLength')),
    confirmPassword: z.string().min(8, t('auth.login.passwordMinLength')),
    contactPerson: z.string().min(1, t('auth.signup.contactPersonRequired')),
    country: z.string().min(1, t('auth.signup.countryRequired')),
    businessRegNo: z.string().min(1, t('auth.signup.businessRegNoRequired')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.resetPassword.passwordsDontMatch'),
    path: ['confirmPassword'],
  }).refine((data) => validateBusinessRegNo(data.country, data.businessRegNo), {
    message: t('auth.signup.invalidBusinessRegNo'),
    path: ['businessRegNo'],
  });

  const form = useForm<ResellerSignupFormValues>({
    resolver: zodResolver(resellerSignupSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      contactPerson: '',
      country: '',
      businessRegNo: '',
    },
  });

  const onSubmit = async (data: ResellerSignupFormValues) => {
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

      // Simulate API call to register reseller
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('Reseller signup data:', {
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
      console.error('Failed to register reseller:', err);
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

      <Card className="w-[400px] border-border">
        <CardHeader className="space-y-2 text-center px-6">
          <CardTitle className="text-2xl font-semibold leading-none">{t('auth.signup.title')}</CardTitle>
          <CardDescription className="text-sm">
            {t('auth.signup.description')}
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <p className="text-xs text-muted-foreground">{t('auth.signup.passwordMinLength')}</p>

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('auth.signup.contactPersonLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.signup.contactPersonPlaceholder')}
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
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('auth.signup.countryLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 bg-white w-full">
                          <SelectValue placeholder={t('countries.southKorea')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        <SelectItem value="South Korea">{t('countries.southKorea')}</SelectItem>
                        <SelectItem value="United States">{t('countries.unitedStates')}</SelectItem>
                        <SelectItem value="Japan">{t('countries.japan')}</SelectItem>
                        <SelectItem value="China">{t('countries.china')}</SelectItem>
                        <SelectItem value="Singapore">{t('countries.singapore')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessRegNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('auth.signup.businessRegNoLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.signup.businessRegNoPlaceholder')}
                        className="h-9 bg-white"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
