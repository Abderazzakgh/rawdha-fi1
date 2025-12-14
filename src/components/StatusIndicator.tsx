import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Activity,
  Shield,
  Zap
} from "lucide-react";

interface StatusIndicatorProps {
  systemStatus: 'active' | 'idle' | 'error' | 'offline';
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  monitoringStatus: 'monitoring' | 'paused' | 'stopped';
  lastUpdate?: Date;
}

export const StatusIndicator = ({ 
  systemStatus, 
  connectionStatus, 
  monitoringStatus, 
  lastUpdate 
}: StatusIndicatorProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'monitoring':
        return 'success';
      case 'connecting':
      case 'paused':
        return 'warning';
      case 'error':
      case 'disconnected':
      case 'stopped':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (type: string, status: string) => {
    switch (type) {
      case 'system':
        switch (status) {
          case 'active': return <Activity className="h-4 w-4" />;
          case 'error': return <AlertTriangle className="h-4 w-4" />;
          default: return <Clock className="h-4 w-4" />;
        }
      case 'connection':
        switch (status) {
          case 'connected': return <Wifi className="h-4 w-4" />;
          case 'disconnected': return <WifiOff className="h-4 w-4" />;
          default: return <Wifi className="h-4 w-4 animate-pulse" />;
        }
      case 'monitoring':
        switch (status) {
          case 'monitoring': return <Zap className="h-4 w-4" />;
          case 'paused': return <Shield className="h-4 w-4" />;
          default: return <CheckCircle className="h-4 w-4" />;
        }
    }
  };

  return (
    <Card className="bg-gradient-card border-primary/20 shadow-card">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            حالة النظام
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* حالة النظام */}
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('system', systemStatus)}
                <span className="text-sm font-medium">النظام</span>
              </div>
              <Badge variant={getStatusColor(systemStatus) as any} className="text-xs">
                {systemStatus === 'active' ? 'نشط' : 
                 systemStatus === 'error' ? 'خطأ' : 
                 systemStatus === 'offline' ? 'غير متصل' : 'خامل'}
              </Badge>
            </div>

            {/* حالة الاتصال */}
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('connection', connectionStatus)}
                <span className="text-sm font-medium">الاتصال</span>
              </div>
              <Badge variant={getStatusColor(connectionStatus) as any} className="text-xs">
                {connectionStatus === 'connected' ? 'متصل' : 
                 connectionStatus === 'disconnected' ? 'منقطع' : 'يتصل...'}
              </Badge>
            </div>

            {/* حالة المراقبة */}
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon('monitoring', monitoringStatus)}
                <span className="text-sm font-medium">المراقبة</span>
              </div>
              <Badge variant={getStatusColor(monitoringStatus) as any} className="text-xs">
                {monitoringStatus === 'monitoring' ? 'يراقب' : 
                 monitoringStatus === 'paused' ? 'متوقف مؤقتاً' : 'متوقف'}
              </Badge>
            </div>
          </div>

          {lastUpdate && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};