import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  StopCircle, 
  Power, 
  RefreshCw,
  Timer,
  Activity,
  Heart,
  Zap,
  XCircle
} from "lucide-react";

interface EmergencyControlsProps {
  isActive: boolean;
  onEmergencyStop: () => void;
  onSystemRestart: () => void;
  onForceShutdown: () => void;
}

export const EmergencyControls = ({ 
  isActive, 
  onEmergencyStop, 
  onSystemRestart, 
  onForceShutdown 
}: EmergencyControlsProps) => {
  const { toast } = useToast();
  const [isShuttingDown, setIsShuttingDown] = useState(false);

  const handleEmergencyStop = async () => {
    toast({
      title: "إيقاف طارئ مفعل ⚠️",
      description: "تم إيقاف جميع العمليات فوراً للحماية",
      variant: "destructive"
    });
    onEmergencyStop();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="bg-gradient-card border-destructive/30 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-destructive">
            <Shield className="h-6 w-6" />
            أدوات التحكم في الطوارئ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-warning bg-warning/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              استخدم هذه الأدوات فقط في حالات الطوارئ. قد تتسبب في فقدان البيانات غير المحفوظة.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-destructive/50">
              <div className="space-y-3 text-center">
                <div className="mx-auto w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                  <StopCircle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-destructive">إيقاف طارئ</h3>
                <p className="text-xs text-muted-foreground">
                  إيقاف فوري لجميع العمليات الجارية
                </p>
                <Button
                  onClick={handleEmergencyStop}
                  variant="destructive"
                  className="w-full"
                  disabled={!isActive}
                >
                  <StopCircle className="h-4 w-4 ml-2" />
                  إيقاف الآن
                </Button>
              </div>
            </Card>

            <Card className="p-4 border-warning/50">
              <div className="space-y-3 text-center">
                <div className="mx-auto w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-warning" />
                </div>
                <h3 className="font-semibold text-warning">إعادة تشغيل</h3>
                <Button onClick={onSystemRestart} className="w-full">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  إعادة تشغيل
                </Button>
              </div>
            </Card>

            <Card className="p-4 border-destructive/50">
              <div className="space-y-3 text-center">
                <div className="mx-auto w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                  <Power className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-destructive">إغلاق قسري</h3>
                <Button onClick={onForceShutdown} variant="destructive" className="w-full">
                  <Power className="h-4 w-4 ml-2" />
                  إغلاق قسري
                </Button>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};