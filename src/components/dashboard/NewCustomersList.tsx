import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils/format';

interface NewCustomer {
  id: string;
  name: string;
  email: string;
}

interface NewCustomersListProps {
  customers: NewCustomer[];
}

export function NewCustomersList({ customers }: NewCustomersListProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between h-8">
          <CardTitle className="text-xl font-semibold leading-none text-foreground flex items-center">{t('dashboard.newCustomers')}</CardTitle>
          <button className="h-8 px-3 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            {t('dashboard.viewAll')}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          {/* Table Header */}
          <div className="flex items-center h-10 px-2 border-b border-border">
            <div className="text-sm font-medium text-foreground">{t('dashboard.customer')}</div>
          </div>

          {/* Table Rows */}
          {customers.map((customer, index) => (
            <button
              key={customer.id}
              className={`flex items-center gap-2 h-18 w-full text-left p-2 hover:bg-muted/50 transition-colors ${index !== customers.length - 1 ? 'border-b border-border' : ''}`}
              onClick={() => {
                // TODO: Navigate to customer detail page
                console.log('Navigate to customer:', customer.id);
              }}
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-muted text-foreground text-sm">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {customer.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.email}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="pt-4 h-9 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {t('dashboard.recentlyOnboardedCustomers')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
