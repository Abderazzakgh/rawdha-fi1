import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  User,
  Users,
  Calendar as CalendarIcon,
  Clock,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { api } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

interface ConfigData {
  username: string;
  password: string;
  groupNumber: string;
  entryDate: Date | undefined;
  exitDate: Date | undefined;
  permitType: 'men' | 'women' | '';
  retryDelay: number;
}

interface ConfigurationModuleProps {
  onConfigSave: (config: ConfigData) => void;
  initialConfig?: ConfigData;
}

export const ConfigurationModule = ({ onConfigSave, initialConfig }: ConfigurationModuleProps) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState<ConfigData>(initialConfig || {
    username: '',
    password: '',
    groupNumber: '',
    entryDate: undefined,
    exitDate: undefined,
    permitType: '',
    retryDelay: 30
  });

  const [isLoading, setIsLoading] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        // Load the most recent account
        const account = await api.getNusukAccount();
        if (account) {
          setAccountId(account.id);
          const monitor = await api.getBookingMonitor(account.id);

          setConfig(prev => ({
            ...prev,
            username: account.username,
            password: account.password_encrypted, // Note: In a real app we wouldn't pull raw password back easily
            groupNumber: monitor?.status?.split('|')[0] || '', // Storing group number in status for now or add column
            permitType: (monitor?.status?.split('|')[1] as any) || '',
            entryDate: monitor?.target_date ? new Date(monitor.target_date) : undefined, // Simplify for demo
            exitDate: undefined, // Needs proper storage
            retryDelay: monitor?.check_interval || 30
          }));
        }
      } catch (error) {
        console.error("Failed to load config", error);
        toast({
          title: "فشل تحميل البيانات",
          description: "تأكد من اتصالك بقاعدة البيانات",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, [toast]);

  const handleSave = async () => {
    // التحقق من البيانات المطلوبة
    if (!config.username || !config.password || !config.groupNumber || !config.entryDate || !config.permitType) {
      toast({
        title: "بيانات ناقصة",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("يجب تسجيل الدخول أولاً لحفظ البيانات");
      }

      // 1. Save Account
      const account = await api.saveNusukAccount({
        username: config.username,
        password_encrypted: config.password,
        user_id: user.id
      });
      setAccountId(account.id);

      // 2. Save Monitor Config
      // Using 'status' field to store groupNumber and permitType for now as simpler workaround 
      // or we should add columns to the table. Let's use status for this demo.
      const statusPayload = `${config.groupNumber}|${config.permitType}`;

      await api.saveBookingMonitor({
        account_id: account.id,
        target_date: config.entryDate.toISOString(),
        check_interval: config.retryDelay,
        is_active: false,
        status: statusPayload
      });

      // Pass the config up
      onConfigSave(config);

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ الإعدادات في قاعدة البيانات",
      });
    } catch (error: any) {
      console.error("Save error", error);
      toast({
        title: "فشل الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            الخطوة الأولى: إعداد بيانات الحساب
          </CardTitle>
          <CardDescription>
            أدخل بيانات حساب نسك أعمال والإعدادات المطلوبة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* بيانات تسجيل الدخول */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              بيانات تسجيل الدخول
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="اسم المستخدم في نسك"
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="كلمة المرور"
                    value={config.password}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    className="text-right pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* إعدادات المجموعة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              إعدادات المجموعة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupNumber">رقم المجموعة</Label>
                <Input
                  id="groupNumber"
                  type="text"
                  placeholder="رقم المجموعة"
                  value={config.groupNumber}
                  onChange={(e) => setConfig({ ...config, groupNumber: e.target.value })}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permitType">نوع التصريح</Label>
                <Select
                  value={config.permitType}
                  onValueChange={(value: 'men' | 'women') => setConfig({ ...config, permitType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع التصريح" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">تصاريح الروضة للرجال</SelectItem>
                    <SelectItem value="women">تصاريح الروضة للنساء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* فترة الزيارة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              فترة الزيارة في المدينة المنورة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ الدخول للمدينة</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right font-normal"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {config.entryDate ? (
                        format(config.entryDate, "PPP", { locale: ar })
                      ) : (
                        <span>اختر تاريخ الدخول</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={config.entryDate}
                      onSelect={(date) => setConfig({ ...config, entryDate: date })}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>تاريخ الخروج من المدينة</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right font-normal"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {config.exitDate ? (
                        format(config.exitDate, "PPP", { locale: ar })
                      ) : (
                        <span>اختر تاريخ الخروج</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={config.exitDate}
                      onSelect={(date) => setConfig({ ...config, exitDate: date })}
                      disabled={(date) => date < new Date() || (config.entryDate && date <= config.entryDate)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Separator />

          {/* إعدادات المراقبة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              إعدادات المراقبة
            </h3>

            <div className="space-y-2">
              <Label htmlFor="retryDelay">مهلة المحاولة (بالثواني)</Label>
              <Input
                id="retryDelay"
                type="number"
                min="10"
                max="300"
                placeholder="30"
                value={config.retryDelay}
                onChange={(e) => setConfig({ ...config, retryDelay: parseInt(e.target.value) || 30 })}
                className="text-right"
              />
              <div className="flex items-center gap-2 p-3 bg-info/10 rounded-lg border border-info/20">
                <Clock className="h-4 w-4 text-info" />
                <p className="text-xs text-info font-medium">
                  الفترة الزمنية بين كل محاولة وأخرى (يُنصح بـ 30 ثانية)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-gradient-hero hover:opacity-90 shadow-floating text-white"
            size="lg"
          >
            {isLoading ? <Loader2 className="h-5 w-5 ml-2 animate-spin" /> : <Save className="h-5 w-5 ml-2" />}
            <span className="text-lg font-semibold">حفظ الإعدادات والمتابعة للمرحلة التالية</span>
          </Button>

          {Object.values(config).some(v => v) && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="text-success font-semibold">البيانات جاهزة - انقر للحفظ والمتابعة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};