import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, 
  Key, 
  Shield, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  Eye,
  Play,
  Pause
} from "lucide-react";

interface SessionStatus {
  isLoggedIn: boolean;
  otpDisabled: boolean;
  sessionValid: boolean;
  lastActivity: Date | null;
  loginAttempts: number;
}

interface SessionManagerProps {
  username: string;
  isActive: boolean;
}

export const SessionManager = ({ username, isActive }: SessionManagerProps) => {
  const { toast } = useToast();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isLoggedIn: false,
    otpDisabled: false,
    sessionValid: false,
    lastActivity: null,
    loginAttempts: 0
  });
  
  const [loginProgress, setLoginProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);

  // محاكاة عملية تسجيل الدخول
  const simulateLogin = async () => {
    setIsLoggingIn(true);
    setLoginProgress(0);
    
    const steps = [
      { step: 'فتح المتصفح...', progress: 20 },
      { step: 'الانتقال لموقع نسك أعمال...', progress: 40 },
      { step: 'إدخال بيانات تسجيل الدخول...', progress: 60 },
      { step: 'انتظار كود OTP...', progress: 80 }
    ];

    for (const { step, progress } of steps) {
      setCurrentStep(step);
      setLoginProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // انتظار OTP
    setAwaitingOtp(true);
    setCurrentStep('يرجى إدخال كود OTP المرسل لهاتفك');
    
    setTimeout(() => {
      if (!awaitingOtp) return;
      
      // محاكاة نجاح تسجيل الدخول
      setLoginProgress(100);
      setCurrentStep('تم تسجيل الدخول بنجاح');
      setSessionStatus({
        ...sessionStatus,
        isLoggedIn: true,
        sessionValid: true,
        lastActivity: new Date(),
        loginAttempts: sessionStatus.loginAttempts + 1
      });
      
      setIsLoggingIn(false);
      setAwaitingOtp(false);
      
      toast({
        title: "نجح تسجيل الدخول",
        description: "تم تسجيل الدخول بنجاح وسيتم إيقاف OTP",
      });

      // محاكاة إيقاف OTP
      setTimeout(() => {
        setSessionStatus(prev => ({
          ...prev,
          otpDisabled: true
        }));
        toast({
          title: "تم إيقاف OTP",
          description: "لن تحتاج لكود OTP في المرات القادمة",
        });
      }, 2000);
    }, 5000);
  };

  // بدء تسجيل الدخول التلقائي
  useEffect(() => {
    if (isActive && username && !autoStarted && !sessionStatus.isLoggedIn) {
      setAutoStarted(true);
      setTimeout(() => {
        simulateLogin();
      }, 500);
    }
  }, [isActive, username, autoStarted, sessionStatus.isLoggedIn]);

  // محاكاة فحص حالة الجلسة
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // محاكاة انتهاء الجلسة أحياناً
      if (Math.random() < 0.1 && sessionStatus.isLoggedIn) {
        setSessionStatus(prev => ({
          ...prev,
          sessionValid: false
        }));
        toast({
          title: "انتهت صلاحية الجلسة",
          description: "سيتم إعادة تسجيل الدخول تلقائياً",
          variant: "destructive",
        });
      } else if (sessionStatus.isLoggedIn) {
        setSessionStatus(prev => ({
          ...prev,
          lastActivity: new Date()
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isActive, sessionStatus.isLoggedIn, toast]);

  const handleOtpSubmit = () => {
    if (otpCode && otpCode.length === 6) {
      setAwaitingOtp(false);
      setLoginProgress(100);
      setCurrentStep('تم التحقق من OTP بنجاح');
    }
  };

  const forceRelogin = () => {
    setSessionStatus({
      ...sessionStatus,
      isLoggedIn: false,
      sessionValid: false
    });
    simulateLogin();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <Card className="shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-primary" />
            الخطوة الثانية: إدارة الجلسة وتسجيل الدخول
          </CardTitle>
          <CardDescription>
            مراقبة حالة الاتصال مع موقع نسك أعمال والتحكم في الجلسة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* حالة الجلسة الحالية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                {sessionStatus.isLoggedIn ? (
                  <CheckCircle className="h-8 w-8 text-success" />
                ) : (
                  <XCircle className="h-8 w-8 text-destructive" />
                )}
                <div>
                  <p className="font-semibold">حالة تسجيل الدخول</p>
                  <Badge variant={sessionStatus.isLoggedIn ? "default" : "destructive"}>
                    {sessionStatus.isLoggedIn ? 'مسجل دخول' : 'غير مسجل'}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                {sessionStatus.otpDisabled ? (
                  <Shield className="h-8 w-8 text-success" />
                ) : (
                  <Key className="h-8 w-8 text-warning" />
                )}
                <div>
                  <p className="font-semibold">حالة OTP</p>
                  <Badge variant={sessionStatus.otpDisabled ? "default" : "secondary"}>
                    {sessionStatus.otpDisabled ? 'معطل' : 'مفعل'}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                {sessionStatus.sessionValid ? (
                  <CheckCircle className="h-8 w-8 text-success" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-warning" />
                )}
                <div>
                  <p className="font-semibold">صلاحية الجلسة</p>
                  <Badge variant={sessionStatus.sessionValid ? "default" : "secondary"}>
                    {sessionStatus.sessionValid ? 'صالحة' : 'منتهية'}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* تفاصيل الجلسة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              تفاصيل الجلسة
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">المستخدم:</span>
                <span className="font-medium mr-2">{username}</span>
              </div>
              <div>
                <span className="text-muted-foreground">محاولات الدخول:</span>
                <span className="font-medium mr-2">{sessionStatus.loginAttempts}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">آخر نشاط:</span>
                <span className="font-medium mr-2">
                  {sessionStatus.lastActivity 
                    ? sessionStatus.lastActivity.toLocaleTimeString('ar-SA')
                    : 'لا يوجد'
                  }
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* عملية تسجيل الدخول */}
          {isLoggingIn && (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-primary/10 border-2 border-primary/30 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center animate-spin-slow">
                    <RefreshCw className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary">جاري تسجيل الدخول...</h3>
                </div>
                <Progress value={loginProgress} className="w-full h-3 mb-2" />
                <p className="text-sm text-muted-foreground text-center">{currentStep}</p>
              </div>
              
              {awaitingOtp && (
                <Card className="p-6 border-warning bg-warning/10 shadow-glow animate-fade-in">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Key className="h-6 w-6 text-warning" />
                      <h4 className="font-semibold text-warning text-lg">كود OTP مطلوب</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      تم إرسال كود التحقق لهاتفك المسجل. الرجاء إدخاله أدناه:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-warning/30 rounded-lg text-center text-lg font-mono bg-background"
                      />
                      <Button 
                        onClick={handleOtpSubmit}
                        disabled={!otpCode || otpCode.length !== 6}
                        className="bg-gradient-primary"
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        تأكيد
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex gap-3">
            <Button
              onClick={simulateLogin}
              disabled={isLoggingIn || sessionStatus.isLoggedIn}
              variant="default"
              className="flex-1"
            >
              <Play className="h-4 w-4 ml-2" />
              بدء تسجيل الدخول
            </Button>
            
            <Button
              onClick={forceRelogin}
              disabled={isLoggingIn}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة تسجيل الدخول
            </Button>
          </div>

          {/* تنبيه آلية إعادة تسجيل الدخول */}
          <Card className="p-4 border-info bg-info/10">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-info mt-1" />
              <div>
                <h4 className="font-semibold text-info mb-1">آلية إعادة التسجيل التلقائي</h4>
                <p className="text-sm text-muted-foreground">
                  البرنامج يراقب حالة الجلسة باستمرار. في حالة انتهاء الصلاحية أو تسجيل الخروج التلقائي، 
                  سيقوم بإعادة تسجيل الدخول تلقائياً وإكمال مهمة المراقبة.
                </p>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};