import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Volume2, 
  Bell, 
  Shield, 
  Palette, 
  Zap, 
  Download,
  Upload,
  RotateCcw,
  Save
} from "lucide-react";

interface AppSettings {
  notifications: {
    sound: boolean;
    push: boolean;
    email: boolean;
    volume: number;
  };
  performance: {
    animationsEnabled: boolean;
    autoSave: boolean;
    maxConcurrentRequests: number;
    refreshInterval: number;
  };
  security: {
    autoLogout: boolean;
    logoutTimeout: number;
    requireConfirmation: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
  };
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      sound: true,
      push: true,
      email: false,
      volume: 75
    },
    performance: {
      animationsEnabled: true,
      autoSave: true,
      maxConcurrentRequests: 3,
      refreshInterval: 30
    },
    security: {
      autoLogout: true,
      logoutTimeout: 30,
      requireConfirmation: true
    },
    appearance: {
      theme: 'auto',
      fontSize: 'medium',
      reducedMotion: false
    }
  });

  const handleSave = () => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ جميع إعداداتك بنجاح",
    });
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem('app_settings');
    setSettings({
      notifications: {
        sound: true,
        push: true,
        email: false,
        volume: 75
      },
      performance: {
        animationsEnabled: true,
        autoSave: true,
        maxConcurrentRequests: 3,
        refreshInterval: 30
      },
      security: {
        autoLogout: true,
        logoutTimeout: 30,
        requireConfirmation: true
      },
      appearance: {
        theme: 'auto',
        fontSize: 'medium',
        reducedMotion: false
      }
    });
    toast({
      title: "تم إعادة تعيين الإعدادات",
      description: "تم استعادة الإعدادات الافتراضية",
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `rawdah-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "تم تصدير الإعدادات",
      description: "تم تنزيل ملف الإعدادات بنجاح",
    });
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          toast({
            title: "تم استيراد الإعدادات",
            description: "تم تحميل إعداداتك بنجاح",
          });
        } catch (error) {
          toast({
            title: "خطأ في الاستيراد",
            description: "فشل في قراءة ملف الإعدادات",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-elegant bg-gradient-card border-primary/20">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6" />
              <div>
                <CardTitle className="text-white">إعدادات التطبيق</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  تخصيص إعدادات النظام والتحكم في الأداء
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          {/* إعدادات الإشعارات */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              إعدادات الإشعارات
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">الأصوات</Label>
                  <p className="text-sm text-muted-foreground">تفعيل أصوات التنبيه</p>
                </div>
                <Switch
                  checked={settings.notifications.sound}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, sound: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">الإشعارات المنبثقة</Label>
                  <p className="text-sm text-muted-foreground">إشعارات الحجز الناجح</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                مستوى الصوت: {settings.notifications.volume}%
              </Label>
              <Slider
                value={[settings.notifications.volume]}
                onValueChange={([value]) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, volume: value }
                  }))
                }
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* إعدادات الأداء */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              إعدادات الأداء
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">الحركات والانتقالات</Label>
                  <p className="text-sm text-muted-foreground">تفعيل تأثيرات الحركة</p>
                </div>
                <Switch
                  checked={settings.performance.animationsEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      performance: { ...prev.performance, animationsEnabled: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">الحفظ التلقائي</Label>
                  <p className="text-sm text-muted-foreground">حفظ الإعدادات تلقائياً</p>
                </div>
                <Switch
                  checked={settings.performance.autoSave}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      performance: { ...prev.performance, autoSave: checked }
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>عدد الطلبات المتزامنة</Label>
                <Select
                  value={settings.performance.maxConcurrentRequests.toString()}
                  onValueChange={(value) =>
                    setSettings(prev => ({
                      ...prev,
                      performance: { ...prev.performance, maxConcurrentRequests: parseInt(value) }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 طلب</SelectItem>
                    <SelectItem value="2">2 طلب</SelectItem>
                    <SelectItem value="3">3 طلبات</SelectItem>
                    <SelectItem value="5">5 طلبات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>فترة التحديث (ثانية)</Label>
                <Input
                  type="number"
                  min="10"
                  max="300"
                  value={settings.performance.refreshInterval}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      performance: { ...prev.performance, refreshInterval: parseInt(e.target.value) || 30 }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* إعدادات الأمان */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              إعدادات الأمان
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">تسجيل الخروج التلقائي</Label>
                  <p className="text-sm text-muted-foreground">عند عدم النشاط</p>
                </div>
                <Switch
                  checked={settings.security.autoLogout}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, autoLogout: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">تأكيد العمليات الحساسة</Label>
                  <p className="text-sm text-muted-foreground">قبل الحذف أو التغيير</p>
                </div>
                <Switch
                  checked={settings.security.requireConfirmation}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, requireConfirmation: checked }
                    }))
                  }
                />
              </div>
            </div>

            {settings.security.autoLogout && (
              <div className="space-y-2">
                <Label>مهلة تسجيل الخروج (دقيقة)</Label>
                <Input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.security.logoutTimeout}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, logoutTimeout: parseInt(e.target.value) || 30 }
                    }))
                  }
                />
              </div>
            )}
          </div>

          <Separator />

          {/* إعدادات المظهر */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              إعدادات المظهر
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المظهر</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value: 'light' | 'dark' | 'auto') =>
                    setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, theme: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">فاتح</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                    <SelectItem value="auto">تلقائي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>حجم الخط</Label>
                <Select
                  value={settings.appearance.fontSize}
                  onValueChange={(value: 'small' | 'medium' | 'large') =>
                    setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, fontSize: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">صغير</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="large">كبير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* إدارة الإعدادات */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">إدارة الإعدادات</h3>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={exportSettings}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                تصدير الإعدادات
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  استيراد الإعدادات
                </Button>
              </div>
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <RotateCcw className="h-4 w-4" />
                إعادة تعيين
              </Button>
            </div>
          </div>

          <Separator />

          {/* أزرار الحفظ والإلغاء */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave}
              className="flex-1 bg-gradient-primary hover:bg-primary/90 shadow-elegant"
            >
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعدادات
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};