import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, RefreshCw } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export interface Notification {
  id: string;
  description: string;
  pageName: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    description: 'DESCRIPTION',
    pageName: 'Page name',
    timestamp: '32 minute ago · 2023.02.21 11:19:22 (GMT +9)',
    isRead: false,
  },
  {
    id: '2',
    description: 'Your contract with TechPartners Solutions is expiring soon. Please review and renew the contract.',
    pageName: 'Contracts',
    timestamp: '1 hour ago · 2023.02.21 10:45:30 (GMT +9)',
    isRead: false,
  },
  {
    id: '3',
    description: 'New payment received from Alex Buckmaster for contract 240115-CUST001-01. The total amount is $4,024.92 and has been successfully processed.',
    pageName: 'Payments',
    timestamp: '2 hours ago · 2023.02.21 09:30:15 (GMT +9)',
    isRead: true,
  },
  {
    id: '4',
    description: 'DESCRIPTION',
    pageName: 'Page name',
    timestamp: '32 minute ago · 2023.02.21 11:19:22 (GMT +9)',
    isRead: true,
  },
];

export function NotificationSheet({ open, onOpenChange }: NotificationSheetProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const allNotifications = notifications;
  const unreadNotifications = notifications.filter(n => !n.isRead);

  const displayNotifications = activeTab === 'all' ? allNotifications : unreadNotifications;

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[384px] p-6 flex flex-col gap-4 h-full">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">Notifications</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')} className="w-full flex flex-col flex-1">
          <TabsList className="w-full h-9 bg-muted p-[3px] rounded-lg">
            <TabsTrigger
              value="all"
              className="flex-1 h-full rounded-md data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-transparent"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="flex-1 h-full rounded-md data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-transparent"
            >
              Unread
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0 flex-1">
            <NotificationList
              notifications={displayNotifications}
              onMarkAsRead={handleMarkAsRead}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="unread" className="mt-0 flex-1">
            <NotificationList
              notifications={displayNotifications}
              onMarkAsRead={handleMarkAsRead}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function NotificationList({ notifications, onMarkAsRead, onClose }: NotificationListProps) {
  const handleRefresh = () => {
    // TODO: Implement refresh logic
    console.log('Refresh notifications');
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 w-full h-full">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Icon with background */}
          <div className="bg-muted rounded-lg flex items-center justify-center w-10 h-10">
            <Bell className="w-6 h-6 text-foreground" />
          </div>

          {/* Text content */}
          <div className="flex flex-col items-center gap-2 text-center w-full">
            <p className="text-lg font-medium text-foreground leading-7">
              No Notifications
            </p>
            <div className="text-sm text-muted-foreground leading-[1.625]">
              <p className="mb-0">You're all caught up.</p>
              <p>New notifications will appear here.</p>
            </div>
          </div>
        </div>

        {/* Refresh button */}
        <div className="flex items-start justify-center w-full h-[88px]">
          <Button
            variant="outline"
            className="h-8 gap-2 px-3 py-2"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs font-medium">Refresh</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      {notifications.map((notification, index) => (
        <div key={notification.id}>
          <NotificationItem
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onClose={onClose}
          />
          {index < notifications.length - 1 && <Separator className="w-full" />}
        </div>
      ))}
    </div>
  );
}

function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  const navigate = useNavigate();

  const handleGoToPage = () => {
    // Mark as read when clicking the button
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    // Close the notification sheet
    onClose();
    // TODO: Implement actual page navigation
    // For now, navigate to 404 page
    navigate('/404');
  };

  return (
    <div className="flex items-start pr-5 w-full">
      {/* Unread indicator */}
      <div className="flex items-start justify-center w-5 pt-[18px] shrink-0">
        {!notification.isRead && (
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2 py-3 min-w-0">
        <div className="flex flex-col gap-0.5 w-full">
          <p className="text-sm font-medium text-foreground leading-5">
            {notification.description}
          </p>
        </div>
        <Button
          variant="link"
          className="h-auto p-0 text-sm font-normal text-foreground justify-start hover:underline"
          onClick={handleGoToPage}
        >
          Go to {notification.pageName}
        </Button>
        <p className="text-xs text-muted-foreground">
          {notification.timestamp}
        </p>
      </div>
    </div>
  );
}
