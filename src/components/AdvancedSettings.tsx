import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings2, 
  Zap, 
  Shield, 
  Clock, 
  Bell,
  Save,
  RotateCcw,
  AlertTriangle
} from "lucide-react";

interface AdvancedSettingsProps {
  onSettingsChange: (settings: any) => void;
}

export const AdvancedSettings = ({ onSettingsChange }: AdvancedSettingsProps) => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    autoRetry: true,
    maxRetries: 5,
    retryInterval: [30],
    enableNotifications: true,
    soundAlerts: false,
    boostMode: false,
    smartReduction: true,
    timeoutDuration: 60,
    userAgent: 'default',
    proxySettings: '',
    debugMode: false,
    logLevel: 'info'
  });

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      autoRetry: true,
      maxRetries: 5,
      retryInterval: [30],
      enableNotifications: true,
      soundAlerts: false,
      boostMode: false,
      smartReduction: true,
      timeoutDuration: 60,
      userAgent: 'default',
      proxySettings: '',
      debugMode: false,
      logLevel: 'info'
    };
    setSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    toast({
      title: "تم إعادة تعيين الإعدادات",
      description: "تم استعادة الإعدادات الافتراضية",
    });
  };

  const saveSettings = () => {
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ جميع الإعدادات المتقدمة بنجاح",
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="bg-gradient-card border-primary/20 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Settings2 className="h-6 w-6 text-primary" />
            الإعدادات المتقدمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* إعدادات الأداء */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              إعدادات الأداء
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxRetries">عدد المحاولات القصوى</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min="1"
                  max="20"
                  value={settings.maxRetries}
                  onChange={(e) => handleSettingChange('maxRetries', parseInt(e.target.value))}
                  className="text-right"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeout">مهلة انتهاء الصلاحية (ثانية)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="30"
                  max="300"
                  value={settings.timeoutDuration}
                  onChange={(e) => handleSettingChange('timeoutDuration', parseInt(e.target.value))}
                  className="text-right"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>فترة المحاولة (ثانية): {settings.retryInterval[0]}</Label>
              <Slider
                value={settings.retryInterval}
                onValueChange={(value) => handleSettingChange('retryInterval', value)}
                max={180}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10 ثانية</span>
                <span>180 ثانية</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div>
                <Label htmlFor="boostMode" className="text-sm font-medium">وضع التسريع</Label>
                <p className="text-xs text-muted-foreground">زيادة سرعة المراقبة والاستجابة</p>
              </div>
              <Switch
                id="boostMode"
                checked={settings.boostMode}
                onCheckedChange={(checked) => handleSettingChange('boostMode', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* إعدادات الأمان */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              إعدادات الأمان
            </h3>
            
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div>
                <Label htmlFor="autoRetry" className="text-sm font-medium">إعادة المحاولة التلقائية</Label>
                <p className="text-xs text-muted-foreground">المحاولة مرة أخرى عند فشل العملية</p>
              </div>
              <Switch
                id="autoRetry"
                checked={settings.autoRetry}
                onCheckedChange={(checked) => handleSettingChange('autoRetry', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div>
                <Label htmlFor="smartReduction" className="text-sm font-medium">التقليل الذكي</Label>
                <p className="text-xs text-muted-foreground">تقليل عدد الأشخاص تلقائياً عند الفشل</p>
              </div>
              <Switch
                id="smartReduction"
                checked={settings.smartReduction}
                onCheckedChange={(checked) => handleSettingChange('smartReduction', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userAgent">وكيل المستخدم</Label>
              <Select
                value={settings.userAgent}
                onValueChange={(value) => handleSettingChange('userAgent', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر وكيل المستخدم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">افتراضي</SelectItem>
                  <SelectItem value="chrome">Chrome</SelectItem>
                  <SelectItem value="firefox">Firefox</SelectItem>
                  <SelectItem value="safari">Safari</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* إعدادات الإشعارات */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-info" />
              إعدادات الإشعارات
            </h3>
            
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div>
                <Label htmlFor="enableNotifications" className="text-sm font-medium">تفعيل الإشعارات</Label>
                <p className="text-xs text-muted-foreground">عرض إشعارات للأحداث المهمة</p>
              </div>
              <Switch
                id="enableNotifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div>
                <Label htmlFor="soundAlerts" className="text-sm font-medium">التنبيهات الصوتية</Label>
                <p className="text-xs text-muted-foreground">تشغيل أصوات للإشعارات المهمة</p>
              </div>
              <Switch
                id="soundAlerts"
                checked={settings.soundAlerts}
                onCheckedChange={(checked) => handleSettingChange('soundAlerts', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* إعدادات المطورين */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              إعدادات المطورين
            </h3>
            
            <Card className="border-warning bg-warning/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-warning mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">تحذير</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  هذه الإعدادات مخصصة للمطورين المتقدمين فقط. تغييرها قد يؤثر على أداء النظام.
                </p>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div>
                <Label htmlFor="debugMode" className="text-sm font-medium">وضع التصحيح</Label>
                <p className="text-xs text-muted-foreground">عرض معلومات إضافية للتصحيح</p>
              </div>
              <Switch
                id="debugMode"
                checked={settings.debugMode}
                onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logLevel">مستوى السجل</Label>
              <Select
                value={settings.logLevel}
                onValueChange={(value) => handleSettingChange('logLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مستوى السجل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">أخطاء فقط</SelectItem>
                  <SelectItem value="warn">تحذيرات وأخطاء</SelectItem>
                  <SelectItem value="info">معلومات عامة</SelectItem>
                  <SelectItem value="debug">تفاصيل كاملة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proxySettings">إعدادات البروكسي (اختياري)</Label>
              <Input
                id="proxySettings"
                type="text"
                placeholder="http://proxy:port"
                value={settings.proxySettings}
                onChange={(e) => handleSettingChange('proxySettings', e.target.value)}
                className="text-right"
              />
            </div>
          </div>

          <Separator />

          {/* أزرار الحفظ */}
          <div className="flex gap-3">
            <Button
              onClick={saveSettings}
              className="flex-1 bg-gradient-primary hover:bg-primary/90 shadow-button"
            >
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعدادات
            </Button>
            <Button
              onClick={resetToDefaults}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 ml-2" />
              إعادة تعيين
            </Button>
          </div>

          {/* معلومات الحالة */}
          <div className="flex justify-center gap-2">
            <Badge variant={settings.boostMode ? "default" : "secondary"} className="text-xs">
              {settings.boostMode ? "وضع التسريع مفعل" : "وضع عادي"}
            </Badge>
            <Badge variant={settings.debugMode ? "destructive" : "outline"} className="text-xs">
              {settings.debugMode ? "وضع التصحيح" : "وضع الإنتاج"}
            </Badge>
            <Badge variant={settings.autoRetry ? "default" : "secondary"} className="text-xs">
              {settings.autoRetry ? "إعادة المحاولة مفعلة" : "إعادة المحاولة معطلة"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};