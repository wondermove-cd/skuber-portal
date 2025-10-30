import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">이름</p>
                <p className="text-base font-medium text-foreground">
                  {user.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">이메일</p>
                <p className="text-base font-medium text-foreground">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">역할</p>
                <p className="text-base font-medium text-foreground">
                  {user.role}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">사용자 ID</p>
                <p className="text-base font-medium text-foreground">
                  {user.id}
                </p>
              </div>
              {user.resellerId && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">리셀러 ID</p>
                    <p className="text-base font-medium text-foreground">
                      {user.resellerId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">리셀러명</p>
                    <p className="text-base font-medium text-foreground">
                      {user.resellerName}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Accounts Info */}
        <Card>
          <CardHeader>
            <CardTitle>테스트 계정 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-2">
                  WM 유저 계정:
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• admin@wondermove.com (WM Admin)</li>
                  <li>• editor@wondermove.com (WM Editor)</li>
                  <li>• viewer@wondermove.com (WM Viewer)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-2">
                  리셀러 유저 계정 (Megazone):
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• admin@megazone.com (Megazone Admin)</li>
                  <li>• editor@megazone.com (Megazone Editor)</li>
                  <li>• viewer@megazone.com (Megazone Viewer)</li>
                </ul>
              </div>
              <p className="text-muted-foreground pt-2">
                모든 계정의 비밀번호: <code className="font-mono">admin123</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
