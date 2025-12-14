import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

interface LiveNotificationsProps {
  systemStats: any;
}

export const LiveNotifications = ({ systemStats }: LiveNotificationsProps) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // محاكاة الإشعارات المباشرة
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        type: Math.random() > 0.5 ? 'success' : 'info',
        message: Math.random() > 0.5 ? 'تم حجز 3 أشخاص بنجاح' : 'جاري المراقبة التلقائية',
        timestamp: new Date()
      };
      setNotifications(prev => [newNotification, ...prev].slice(0, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Info className="h-4 w-4 text-info" />;
    }
  };

  return (
    <Card className="bg-gradient-card border-primary/20 shadow-card" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          الإشعارات المباشرة
          <Badge variant="outline">{notifications.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60">
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد إشعارات حديثة
              </p>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className="p-3">
                  <div className="flex items-center gap-2">
                    {getIcon(notification.type)}
                    <span className="text-sm">{notification.message}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.timestamp.toLocaleTimeString('ar-SA')}
                  </p>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};