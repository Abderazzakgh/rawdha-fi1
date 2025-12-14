import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  Download, 
  Upload,
  Zap,
  Shield,
  BarChart3,
  Save
} from "lucide-react";

interface QuickActionsProps {
  isMonitoring: boolean;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  onRestart: () => void;
  onExportReport: () => void;
  onImportConfig: () => void;
  onQuickSettings: () => void;
}

export const QuickActions = ({
  isMonitoring,
  onStartMonitoring,
  onStopMonitoring,
  onRestart,
  onExportReport,
  onImportConfig,
  onQuickSettings
}: QuickActionsProps) => {
  const { toast } = useToast();

  const handleEmergencyStop = () => {
    onStopMonitoring();
    toast({
      title: "إيقاف طارئ",
      description: "تم إيقاف جميع العمليات فوراً",
      variant: "destructive"
    });
  };

  const handleBoostMode = () => {
    toast({
      title: "وضع التسريع",
      description: "تم تفعيل وضع المراقبة المكثفة",
    });
  };

  return (
    <Card className="bg-gradient-card border-primary/20 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" />
          إجراءات سريعة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* بدء/إيقاف المراقبة */}
          {!isMonitoring ? (
            <Button
              onClick={onStartMonitoring}
              className="bg-gradient-primary hover:bg-primary/90 shadow-button h-16 flex-col gap-1"
            >
              <Play className="h-5 w-5" />
              <span className="text-xs">بدء المراقبة</span>
            </Button>
          ) : (
            <Button
              onClick={onStopMonitoring}
              variant="destructive"
              className="h-16 flex-col gap-1"
            >
              <Pause className="h-5 w-5" />
              <span className="text-xs">إيقاف المراقبة</span>
            </Button>
          )}

          {/* إعادة تشغيل */}
          <Button
            onClick={onRestart}
            variant="outline"
            className="h-16 flex-col gap-1 hover:bg-warning/10 hover:border-warning"
          >
            <RefreshCw className="h-5 w-5" />
            <span className="text-xs">إعادة تشغيل</span>
          </Button>

          {/* الإعدادات السريعة */}
          <Button
            onClick={onQuickSettings}
            variant="outline"
            className="h-16 flex-col gap-1 hover:bg-info/10 hover:border-info"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">إعدادات سريعة</span>
          </Button>

          {/* تصدير التقرير */}
          <Button
            onClick={onExportReport}
            variant="outline"
            className="h-16 flex-col gap-1 hover:bg-success/10 hover:border-success"
          >
            <Download className="h-5 w-5" />
            <span className="text-xs">تصدير تقرير</span>
          </Button>

          {/* استيراد إعدادات */}
          <Button
            onClick={onImportConfig}
            variant="outline"
            className="h-16 flex-col gap-1"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs">استيراد إعدادات</span>
          </Button>

          {/* وضع التسريع */}
          <Button
            onClick={handleBoostMode}
            variant="outline"
            className="h-16 flex-col gap-1 hover:bg-secondary/10 hover:border-secondary"
            disabled={!isMonitoring}
          >
            <Zap className="h-5 w-5" />
            <span className="text-xs">وضع التسريع</span>
          </Button>

          {/* إيقاف طارئ */}
          <Button
            onClick={handleEmergencyStop}
            variant="destructive"
            className="h-16 flex-col gap-1"
          >
            <Shield className="h-5 w-5" />
            <span className="text-xs">إيقاف طارئ</span>
          </Button>

          {/* عرض الإحصائيات */}
          <Button
            variant="outline"
            className="h-16 flex-col gap-1 hover:bg-info/10 hover:border-info"
            onClick={() => toast({
              title: "الإحصائيات",
              description: "ستفتح نافذة الإحصائيات المفصلة قريباً"
            })}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">الإحصائيات</span>
          </Button>
        </div>

        {/* مؤشرات الحالة */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
          <Badge variant={isMonitoring ? "default" : "secondary"} className="text-xs">
            {isMonitoring ? "نشط" : "غير نشط"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            وضع ذكي
          </Badge>
          <Badge variant="outline" className="text-xs">
            حفظ تلقائي
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};