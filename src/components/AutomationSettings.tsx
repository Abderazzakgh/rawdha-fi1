import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings2, 
  Zap, 
  Clock, 
  Shield, 
  Bell, 
  Bot,
  Save,
  RotateCw,
  AlertTriangle
} from "lucide-react";

interface AutomationConfig {
  maxRetries: number;
  retryDelay: number;
  smartGrouping: boolean;
  autoRelogin: boolean;
  notifications: boolean;
  soundAlerts: boolean;
  priority: 'speed' | 'accuracy' | 'stealth';
  maxConcurrent: number;
  throttleMode: boolean;
  emergencyStop: boolean;
}

interface AutomationSettingsProps {
  config: AutomationConfig;
  onConfigChange: (config: AutomationConfig) => void;
  isActive: boolean;
}

export const AutomationSettings = ({ config, onConfigChange, isActive }: AutomationSettingsProps) => {
  const { toast } = useToast();
  const [tempConfig, setTempConfig] = useState<AutomationConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigUpdate = (key: keyof AutomationConfig, value: any) => {
    const newConfig = { ...tempConfig, [key]: value };
    setTempConfig(newConfig);
    setHasChanges(true);
  };

  const saveConfig = () => {
    onConfigChange(tempConfig);
    setHasChanges(false);
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تطبيق إعدادات الأتمتة الجديدة",
    });
  };

  const resetToDefaults = () => {
    const defaultConfig: AutomationConfig = {
      maxRetries: 50,
      retryDelay: 30,
      smartGrouping: true,
      autoRelogin: true,
      notifications: true,
      soundAlerts: false,
      priority: 'accuracy',
      maxConcurrent: 3,
      throttleMode: true,
      emergencyStop: true
    };
    setTempConfig(defaultConfig);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Settings2 className="h-6 w-6 text-primary" />
            إعدادات الأتمتة المتقدمة
          </CardTitle>
          <CardDescription>
            تخصيص سلوك النظام والتحكم في آليات المراقبة والحجز التلقائي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* إعدادات المحاولات */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <RotateCw className="h-5 w-5" />
              إعدادات المحاولات
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxRetries">الحد الأقصى للمحاولات</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min="1"
                  max="200"
                  value={tempConfig.maxRetries}
                  onChange={(e) => handleConfigUpdate('maxRetries', parseInt(e.target.value) || 50)}
                  disabled={isActive}
                  className="text-right"
                />
                <p className="text-xs text-muted-foreground">
                  عدد المحاولات قبل التوقف (1-200)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retryDelay">مهلة بين المحاولات (ثانية)</Label>
                <Input
                  id="retryDelay"
                  type="number"
                  min="5"
                  max="300"
                  value={tempConfig.retryDelay}
                  onChange={(e) => handleConfigUpdate('retryDelay', parseInt(e.target.value) || 30)}
                  disabled={isActive}
                  className="text-right"
                />
                <p className="text-xs text-muted-foreground">
                  الوقت بين كل محاولة وأخرى (5-300 ثانية)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* إعدادات الذكاء الاصطناعي */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5" />
              الذكاء الاصطناعي
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">التجميع الذكي للأشخاص</p>
                  <p className="text-sm text-muted-foreground">
                    تقليل عدد الأشخاص تلقائياً عند فشل الحجز
                  </p>
                </div>
                <Switch
                  checked={tempConfig.smartGrouping}
                  onCheckedChange={(checked) => handleConfigUpdate('smartGrouping', checked)}
                  disabled={isActive}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">إعادة التسجيل التلقائي</p>
                  <p className="text-sm text-muted-foreground">
                    تسجيل دخول تلقائي عند انتهاء الجلسة
                  </p>
                </div>
                <Switch
                  checked={tempConfig.autoRelogin}
                  onCheckedChange={(checked) => handleConfigUpdate('autoRelogin', checked)}
                  disabled={isActive}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">نمط الخفاء (Throttle Mode)</p>
                  <p className="text-sm text-muted-foreground">
                    تقليل سرعة الطلبات لتجنب الحظر
                  </p>
                </div>
                <Switch
                  checked={tempConfig.throttleMode}
                  onCheckedChange={(checked) => handleConfigUpdate('throttleMode', checked)}
                  disabled={isActive}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* أولوية النظام */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5" />
              أولوية النظام
            </h3>
            
            <div className="space-y-2">
              <Label>اختر نمط التشغيل</Label>
              <Select
                value={tempConfig.priority}
                onValueChange={(value: 'speed' | 'accuracy' | 'stealth') => 
                  handleConfigUpdate('priority', value)
                }
                disabled={isActive}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speed">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      السرعة - محاولات سريعة ومتكررة
                    </div>
                  </SelectItem>
                  <SelectItem value="accuracy">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      الدقة - توازن بين السرعة والأمان
                    </div>
                  </SelectItem>
                  <SelectItem value="stealth">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      الخفاء - بطيء وآمن
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <Card className={`p-2 ${tempConfig.priority === 'speed' ? 'border-primary bg-primary/10' : ''}`}>
                  <p className="font-medium">السرعة</p>
                  <p className="text-muted-foreground">فترات قصيرة، خطر متوسط</p>
                </Card>
                <Card className={`p-2 ${tempConfig.priority === 'accuracy' ? 'border-primary bg-primary/10' : ''}`}>
                  <p className="font-medium">الدقة</p>
                  <p className="text-muted-foreground">متوازن ومُنصح به</p>
                </Card>
                <Card className={`p-2 ${tempConfig.priority === 'stealth' ? 'border-primary bg-primary/10' : ''}`}>
                  <p className="font-medium">الخفاء</p>
                  <p className="text-muted-foreground">فترات طويلة، آمن جداً</p>
                </Card>
              </div>
            </div>
          </div>

          <Separator />

          {/* الإشعارات */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              الإشعارات والتنبيهات
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">الإشعارات المرئية</p>
                  <p className="text-sm text-muted-foreground">
                    إظهار إشعارات على الشاشة عند نجاح/فشل الحجز
                  </p>
                </div>
                <Switch
                  checked={tempConfig.notifications}
                  onCheckedChange={(checked) => handleConfigUpdate('notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">التنبيهات الصوتية</p>
                  <p className="text-sm text-muted-foreground">
                    تشغيل صوت عند نجاح الحجز أو حدوث خطأ
                  </p>
                </div>
                <Switch
                  checked={tempConfig.soundAlerts}
                  onCheckedChange={(checked) => handleConfigUpdate('soundAlerts', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* إعدادات الأمان */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              إعدادات الأمان
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxConcurrent">عدد العمليات المتزامنة</Label>
                <Input
                  id="maxConcurrent"
                  type="number"
                  min="1"
                  max="10"
                  value={tempConfig.maxConcurrent}
                  onChange={(e) => handleConfigUpdate('maxConcurrent', parseInt(e.target.value) || 3)}
                  disabled={isActive}
                  className="text-right"
                />
                <p className="text-xs text-muted-foreground">
                  عدد المحاولات المتزامنة (1-10)
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">زر الطوارئ</p>
                  <p className="text-sm text-muted-foreground">
                    إيقاف فوري عند حدوث مشاكل
                  </p>
                </div>
                <Switch
                  checked={tempConfig.emergencyStop}
                  onCheckedChange={(checked) => handleConfigUpdate('emergencyStop', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* أزرار التحكم */}
          <div className="flex gap-3">
            <Button
              onClick={saveConfig}
              disabled={!hasChanges || isActive}
              className="flex-1 bg-gradient-primary hover:bg-primary/90 shadow-elegant"
            >
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعدادات
            </Button>
            
            <Button
              onClick={resetToDefaults}
              disabled={isActive}
              variant="outline"
              className="flex-1"
            >
              <RotateCw className="h-4 w-4 ml-2" />
              الإعدادات الافتراضية
            </Button>
          </div>

          {/* تحذير عن النظام النشط */}
          {isActive && (
            <Card className="p-4 border-warning bg-warning/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-1" />
                <div>
                  <h4 className="font-semibold text-warning mb-1">النظام نشط</h4>
                  <p className="text-sm text-muted-foreground">
                    لا يمكن تعديل الإعدادات أثناء تشغيل المراقبة. قم بإيقاف النظام أولاً لإجراء التغييرات.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* معلومات الاستخدام */}
          <Card className="p-4 border-info bg-info/10">
            <div className="flex items-start gap-3">
              <Bot className="h-5 w-5 text-info mt-1" />
              <div>
                <h4 className="font-semibold text-info mb-2">نصائح للاستخدام الأمثل</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• استخدم نمط "الدقة" للحصول على أفضل نتائج</li>
                  <li>• فعل "التجميع الذكي" لتحسين معدل النجاح</li>
                  <li>• نمط "الخفاء" آمن للاستخدام لفترات طويلة</li>
                  <li>• لا تزيد العمليات المتزامنة عن 5 لتجنب الحظر</li>
                </ul>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};