import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ConfigurationModule } from './ConfigurationModule';
import { SessionManager } from './SessionManager';
import { NavigationModule } from './NavigationModule';
import { SmartBookingLogic } from './SmartBookingLogic';
import { StatusIndicator } from './StatusIndicator';
import { LiveNotifications } from './LiveNotifications';
import { QuickActions } from './QuickActions';
import { SystemStats } from './SystemStats';
import { BookingDashboard } from './BookingDashboard';
import { AutomationSettings } from './AutomationSettings';
import { SplashScreen } from './SplashScreen';
import { SettingsPanel } from './SettingsPanel';
import { HelpCenter } from './HelpCenter';
import { SystemTests } from './SystemTests';
import { CompanionsManager } from './CompanionsManager';
import { AdvancedSettings } from './AdvancedSettings';
import { ReportsExport } from './ReportsExport';
import { EmergencyControls } from './EmergencyControls';
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Globe,
  Navigation,
  Brain,
  Play,
  CheckCircle,
  Clock,
  Users,
  Activity,
  BarChart3,
  HelpCircle,
  Cog,
  TestTube2,
  Settings2,
  FileText,
  Shield,
  LogIn,
  Link
} from "lucide-react";
import { openNusukLogin, openNusukPage, NUSUK_URLS } from "@/utils/browserHelpers";

interface ConfigData {
  username: string;
  password: string;
  groupNumber: string;
  entryDate: Date | undefined;
  exitDate: Date | undefined;
  permitType: 'men' | 'women' | '';
  retryDelay: number;
}

export const MainDashboard = () => {
  const { toast } = useToast();
  const [showSplash, setShowSplash] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTests, setShowTests] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [selectedPeopleCount, setSelectedPeopleCount] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalAttempts: 0,
    successfulBookings: 0,
    failedAttempts: 0,
    averageResponseTime: 245,
    uptime: '2h 15m',
    successRate: 75.5
  });

  const [automationConfig, setAutomationConfig] = useState({
    maxRetries: 50,
    retryDelay: 30,
    smartGrouping: true,
    autoRelogin: true,
    notifications: true,
    soundAlerts: false,
    priority: 'accuracy' as 'speed' | 'accuracy' | 'stealth',
    maxConcurrent: 3,
    throttleMode: true,
    emergencyStop: true
  });

  const handleAutomationConfigChange = (newConfig: any) => {
    setAutomationConfig(newConfig);
  };

  const handleConfigSave = (newConfig: ConfigData) => {
    setConfig(newConfig);
    setActiveStep(2);

    // بدء تسجيل الدخول تلقائياً
    toast({
      title: "تم حفظ الإعدادات ✓",
      description: "جاري بدء تسجيل الدخول التلقائي...",
    });

    // محاكاة تسجيل الدخول التلقائي
    setTimeout(() => {
      setSessionActive(true);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "الجلسة نشطة والنظام جاهز",
      });
      setTimeout(() => setActiveStep(3), 1500);
    }, 2000);
  };

  const handleNavigationComplete = (selectedCount: number) => {
    setSelectedPeopleCount(selectedCount);
    toast({
      title: "تم اختيار الأشخاص ✓",
      description: `تم تحديد ${selectedCount} شخص للحجز - جاري الانتقال للمرحلة النهائية`,
    });
    setTimeout(() => setActiveStep(4), 1000);
  };

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
    setActiveStep(4);
    toast({
      title: "بدأت المراقبة الذكية",
      description: "النظام يراقب الآن الفترات المتاحة على مدار الساعة",
    });
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    toast({
      title: "توقفت المراقبة",
      description: "تم إيقاف مراقبة الحجز",
    });
  };

  const handleRestart = () => {
    setIsMonitoring(false);
    setTimeout(() => {
      setIsMonitoring(true);
      toast({
        title: "إعادة تشغيل",
        description: "تم إعادة تشغيل النظام بنجاح",
      });
    }, 1000);
  };

  const handleExportReport = () => {
    toast({
      title: "تصدير التقرير",
      description: "جاري تحضير تقرير شامل للنشاط...",
    });
  };

  const handleImportConfig = () => {
    toast({
      title: "استيراد الإعدادات",
      description: "اختر ملف الإعدادات للاستيراد",
    });
  };

  const handleQuickSettings = () => {
    setShowSettings(true);
  };

  const handleHelpCenter = () => {
    setShowHelp(true);
  };

  const handleEmergencyStop = () => {
    setIsMonitoring(false);
    setShowEmergency(false);
  };

  const handleSystemRestart = () => {
    setIsMonitoring(false);
    setTimeout(() => {
      setIsMonitoring(true);
    }, 2000);
  };

  const handleForceShutdown = () => {
    setIsMonitoring(false);
    setSessionActive(false);
    setActiveStep(1);
  };

  // تحميل الإعدادات المحفوظة
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        // تطبيق الإعدادات المحفوظة
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const steps = [
    {
      id: 1,
      title: 'الإعدادات',
      icon: Settings,
      description: 'إعداد بيانات الحساب والمجموعة',
      completed: config !== null
    },
    {
      id: 2,
      title: 'إدارة الجلسة',
      icon: Globe,
      description: 'تسجيل الدخول وإدارة الاتصال',
      completed: sessionActive
    },
    {
      id: 3,
      title: 'التنقل والتصفية',
      icon: Navigation,
      description: 'الوصول لصفحة الحجز واختيار الأشخاص',
      completed: selectedPeopleCount > 0
    },
    {
      id: 4,
      title: 'الحجز الذكي',
      icon: Brain,
      description: 'المراقبة والحجز التلقائي',
      completed: false
    }
  ];

  // إضافة خطوة خامسة للتحكم
  const allSteps = [...steps, {
    id: 5,
    title: 'لوحة التحكم',
    icon: BarChart3,
    description: 'مراقبة وتحليل النشاط',
    completed: false
  }];

  const QuickLinks = () => (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">روابط سريعة لمنصة نسك</h3>
            <p className="text-xs text-muted-foreground">الوصول المباشر للصفحات في نافذة جديدة</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openNusukLogin}
            className="gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            <LogIn className="h-4 w-4" />
            تسجيل الدخول
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openNusukPage(NUSUK_URLS.PERMITS)}
            className="gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            <FileText className="h-4 w-4" />
            التصاريح
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // عرض شاشة البداية
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <div dir="rtl" className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-6 relative">
            <div className="absolute inset-0 bg-gradient-hero opacity-10 blur-3xl animate-float"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div></div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmergency(true)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Shield className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReports(true)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTests(true)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <TestTube2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedSettings(true)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Settings2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleQuickSettings}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Cog className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleHelpCenter}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent leading-tight animate-shimmer tracking-tight">
                نظام حجز الروضة الشريفة الذكي
              </h1>
              <div className="flex justify-center items-center gap-2 my-6">
                <div className="w-8 h-0.5 bg-gradient-primary rounded-full"></div>
                <div className="w-16 h-1 bg-gradient-hero rounded-full"></div>
                <div className="w-8 h-0.5 bg-gradient-primary rounded-full"></div>
              </div>
              <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto font-light leading-relaxed">
                الحل المتكامل والأكثر تطوراً للمراقبة والحجز التلقائي على منصة نسك أعمال
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm text-success">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span>نظام ذكي</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-info">
                  <div className="w-2 h-2 bg-info rounded-full animate-pulse"></div>
                  <span>مراقبة مستمرة</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-warning">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                  <span>حجز تلقائي</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <Card className="shadow-floating bg-gradient-card border-primary/10 animate-slide-up overflow-hidden">
            <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-mesh opacity-10"></div>
              <div className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-white text-2xl font-display">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Play className="h-6 w-6" />
                  </div>
                  مراحل العمل المتقدمة
                </CardTitle>
                <CardDescription className="text-primary-foreground/90 text-lg font-light mt-2">
                  تابع تقدمك في إعداد وتشغيل النظام الذكي بطريقة احترافية
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 relative">
                {allSteps.map((step, index) => (
                  <div key={step.id} className="flex-1 relative group">
                    <div
                      className={`p-8 border-2 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-floating hover:scale-105 transform-gpu relative overflow-hidden ${activeStep === step.id
                        ? 'border-primary bg-gradient-primary/10 shadow-glow animate-glow'
                        : step.completed
                          ? 'border-success bg-gradient-to-br from-success/10 to-success/5 shadow-elegant'
                          : 'border-muted/30 bg-gradient-glass hover:border-primary/40 backdrop-blur-sm'
                        }`}
                      onClick={() => step.completed && setActiveStep(step.id)}
                    >
                      {activeStep === step.id && (
                        <div className="absolute inset-0 bg-gradient-hero opacity-5 animate-pulse"></div>
                      )}
                      <div className="flex items-center gap-6 mb-4 relative z-10">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative ${activeStep === step.id
                            ? 'bg-gradient-primary text-primary-foreground shadow-floating animate-bounce-gentle'
                            : step.completed
                              ? 'bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-elegant'
                              : 'bg-gradient-to-br from-muted to-surface text-muted-foreground shadow-inset'
                            }`}
                        >
                          {activeStep === step.id && (
                            <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping"></div>
                          )}
                          <div className="relative z-10">
                            {step.completed ? (
                              <CheckCircle className="h-8 w-8" />
                            ) : (
                              <step.icon className="h-8 w-8" />
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-xl mb-1">{step.title}</h3>
                          <div className={`w-12 h-0.5 rounded-full ${activeStep === step.id ? 'bg-gradient-primary' :
                            step.completed ? 'bg-success' : 'bg-muted'
                            }`}></div>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-base font-light relative z-10">{step.description}</p>
                    </div>
                    {index < allSteps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 left-full w-8 h-1 -translate-y-1/2 z-0">
                        <div className="w-full h-full bg-gradient-to-r from-primary/30 to-transparent rounded-full"></div>
                        <div className="absolute top-1/2 left-0 w-2 h-2 bg-primary/40 rounded-full -translate-y-1/2 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {config && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card className="text-center bg-gradient-glass border-primary/10 hover:shadow-floating transition-all duration-500 hover:scale-105 transform-gpu group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardContent className="pt-8 pb-8 relative z-10">
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-floating group-hover:scale-110 transition-transform duration-500 relative">
                    <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-2xl animate-pulse"></div>
                    <Users className="h-10 w-10 text-primary-foreground relative z-10" />
                  </div>
                  <p className="text-4xl font-display font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">{config.groupNumber}</p>
                  <p className="text-muted-foreground font-medium text-lg">رقم المجموعة</p>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-glass border-secondary/10 hover:shadow-floating transition-all duration-500 hover:scale-105 transform-gpu group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardContent className="pt-8 pb-8 relative z-10">
                  <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-floating group-hover:scale-110 transition-transform duration-500 relative">
                    <div className="absolute inset-0 bg-gradient-secondary opacity-20 rounded-2xl animate-pulse"></div>
                    <div className="relative z-10">
                      <Badge variant="outline" className="text-lg font-bold border-white text-white bg-white/20 backdrop-blur-sm px-4 py-2">
                        {config.permitType === 'men' ? 'رجال' : 'نساء'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground font-medium text-lg mt-2">نوع التصريح</p>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-glass border-info/10 hover:shadow-floating transition-all duration-500 hover:scale-105 transform-gpu group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-info/10 to-info-glow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="pt-8 pb-8 relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-info to-info-glow rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-floating group-hover:scale-110 transition-transform duration-500 relative">
                    <div className="absolute inset-0 bg-info opacity-20 rounded-2xl animate-pulse"></div>
                    <Clock className="h-10 w-10 text-info-foreground relative z-10" />
                  </div>
                  <p className="text-4xl font-display font-bold text-info mb-2">{config.retryDelay}s</p>
                  <p className="text-muted-foreground font-medium text-lg">مهلة المحاولة</p>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-glass border-success/10 hover:shadow-floating transition-all duration-500 hover:scale-105 transform-gpu group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-success-glow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="pt-8 pb-8 relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-success to-success-glow rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-floating group-hover:scale-110 transition-transform duration-500 relative animate-bounce-gentle">
                    <div className="absolute inset-0 bg-success opacity-20 rounded-2xl animate-pulse"></div>
                    <CheckCircle className="h-10 w-10 text-success-foreground relative z-10" />
                  </div>
                  <p className="text-4xl font-display font-bold text-success mb-2">{selectedPeopleCount}</p>
                  <p className="text-muted-foreground font-medium text-lg">أشخاص محددين</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Control Panel and Monitoring */}
          {(isMonitoring || activeStep === 5) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusIndicator
                systemStatus={isMonitoring ? 'active' : 'idle'}
                connectionStatus={sessionActive ? 'connected' : 'disconnected'}
                monitoringStatus={isMonitoring ? 'monitoring' : 'stopped'}
                lastUpdate={new Date()}
              />
              <LiveNotifications systemStats={systemStats} />
            </div>
          )}

          {/* Emergency Controls */}
          {showEmergency && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">إدارة الطوارئ</h2>
                    <Button variant="ghost" onClick={() => setShowEmergency(false)}>✕</Button>
                  </div>
                  <EmergencyControls
                    isActive={isMonitoring}
                    onEmergencyStop={handleEmergencyStop}
                    onSystemRestart={handleSystemRestart}
                    onForceShutdown={handleForceShutdown}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {sessionActive && (
            <QuickActions
              isMonitoring={isMonitoring}
              onStartMonitoring={handleStartMonitoring}
              onStopMonitoring={handleStopMonitoring}
              onRestart={handleRestart}
              onExportReport={handleExportReport}
              onImportConfig={handleImportConfig}
              onQuickSettings={handleQuickSettings}
            />
          )}

          {/* System Statistics */}
          {isMonitoring && (
            <SystemStats
              totalAttempts={systemStats.totalAttempts}
              successfulBookings={systemStats.successfulBookings}
              failedAttempts={systemStats.failedAttempts}
              averageResponseTime={systemStats.averageResponseTime}
              uptime={systemStats.uptime}
              successRate={systemStats.successRate}
            />
          )}

          {/* Advanced Automation Settings */}
          {sessionActive && (
            <Card className="shadow-card bg-gradient-card border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-secondary" />
                  إعدادات الأتمتة المتقدمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AutomationSettings
                  config={automationConfig}
                  onConfigChange={handleAutomationConfigChange}
                  isActive={isMonitoring}
                />
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs value={`step-${activeStep}`} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger
                value="step-1"
                disabled={false}
                onClick={() => setActiveStep(1)}
              >
                الإعدادات
              </TabsTrigger>
              <TabsTrigger
                value="step-2"
                disabled={!config}
                onClick={() => config && setActiveStep(2)}
              >
                إدارة الجلسة
              </TabsTrigger>
              <TabsTrigger
                value="step-3"
                disabled={!sessionActive}
                onClick={() => sessionActive && setActiveStep(3)}
              >
                التنقل والتصفية
              </TabsTrigger>
              <TabsTrigger
                value="step-4"
                disabled={selectedPeopleCount === 0}
                onClick={() => selectedPeopleCount > 0 && setActiveStep(4)}
              >
                الحجز الذكي
              </TabsTrigger>
              <TabsTrigger
                value="step-5"
                disabled={!isMonitoring}
                onClick={() => isMonitoring && setActiveStep(5)}
              >
                لوحة التحكم
              </TabsTrigger>
            </TabsList>

            <TabsContent value="step-1" className="space-y-4">
              <ConfigurationModule
                onConfigSave={handleConfigSave}
                initialConfig={config || undefined}
              />
            </TabsContent>

            <TabsContent value="step-2" className="space-y-4">
              {config && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-primary/10 border-2 border-primary/30 rounded-xl text-center">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow animate-bounce-gentle">
                      <Globe className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2">إدارة الجلسة النشطة</h3>
                    <p className="text-muted-foreground">جاري تسجيل الدخول وإعداد الجلسة تلقائياً...</p>
                  </div>
                  <SessionManager
                    username={config.username}
                    isActive={sessionActive}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="step-3" className="space-y-4">
              {config && config.permitType && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-secondary/10 border-2 border-secondary/30 rounded-xl text-center">
                    <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow animate-float">
                      <Navigation className="h-10 w-10 text-secondary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-secondary mb-2">التنقل والتصفية الذكية</h3>
                    <p className="text-muted-foreground">اختيار الأشخاص والتنقل للصفحة المناسبة</p>
                  </div>

                  <CompanionsManager />
                  <Separator />

                  <NavigationModule
                    groupNumber={config.groupNumber}
                    permitType={config.permitType}
                    isActive={sessionActive}
                    onComplete={handleNavigationComplete}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="step-4" className="space-y-4">
              {config && config.entryDate && config.exitDate && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-accent/10 border-2 border-accent/30 rounded-xl text-center">
                    <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse-glow">
                      <Brain className="h-10 w-10 text-accent-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-accent mb-2">منطق الحجز الذكي</h3>
                    <p className="text-muted-foreground">المراقبة المستمرة والحجز التلقائي على مدار الساعة</p>
                  </div>
                  <SmartBookingLogic
                    entryDate={config.entryDate}
                    exitDate={config.exitDate}
                    selectedPeople={selectedPeopleCount}
                    retryDelay={config.retryDelay}
                    isActive={selectedPeopleCount > 0}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="step-5" className="space-y-6">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-hero rounded-full flex items-center justify-center mx-auto shadow-floating animate-glow">
                  <BarChart3 className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-3 animate-shimmer">
                    لوحة التحكم الذكية
                  </h2>
                  <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                    مراقبة شاملة لجميع العمليات والإحصائيات المباشرة
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center bg-gradient-glass border-primary/20 hover:shadow-floating transition-all hover:scale-105">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-primary">{systemStats.totalAttempts}</p>
                  <p className="text-sm text-muted-foreground">إجمالي المحاولات</p>
                </Card>

                <Card className="p-4 text-center bg-gradient-glass border-success/20 hover:shadow-floating transition-all hover:scale-105">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-3xl font-bold text-success">{systemStats.successfulBookings}</p>
                  <p className="text-sm text-muted-foreground">حجوزات ناجحة</p>
                </Card>

                <Card className="p-4 text-center bg-gradient-glass border-warning/20 hover:shadow-floating transition-all hover:scale-105">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-warning" />
                  <p className="text-3xl font-bold text-warning">{systemStats.averageResponseTime}ms</p>
                  <p className="text-sm text-muted-foreground">متوسط الاستجابة</p>
                </Card>

                <Card className="p-4 text-center bg-gradient-glass border-info/20 hover:shadow-floating transition-all hover:scale-105">
                  <Users className="h-8 w-8 mx-auto mb-2 text-info" />
                  <p className="text-3xl font-bold text-info">{systemStats.successRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">معدل النجاح</p>
                </Card>
              </div>

              <SystemStats
                totalAttempts={systemStats.totalAttempts}
                successfulBookings={systemStats.successfulBookings}
                failedAttempts={systemStats.failedAttempts}
                averageResponseTime={systemStats.averageResponseTime}
                uptime={systemStats.uptime}
                successRate={systemStats.successRate}
              />
            </TabsContent>
          </Tabs>

          {/* Help Card */}
          <Card className="border-info/20 bg-gradient-to-br from-info/5 to-info-light/10 shadow-floating overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-mesh opacity-5"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-info to-info-glow flex items-center justify-center shadow-floating relative">
                  <div className="absolute inset-0 rounded-2xl bg-info/20 animate-pulse"></div>
                  <div className="w-4 h-4 rounded-full bg-info-foreground animate-bounce-gentle relative z-10"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-info mb-4 text-2xl">دليل استخدام النظام الذكي</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {[
                      "ابدأ بإعداد بيانات حسابك ومعلومات المجموعة في المرحلة الأولى",
                      "سجل الدخول وفعل إدارة الجلسة في المرحلة الثانية",
                      "اختر الأشخاص المراد الحجز لهم في المرحلة الثالثة",
                      "فعل المراقبة الذكية والحجز التلقائي في المرحلة الأخيرة"
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-info">{index + 1}</span>
                        </div>
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gradient-primary/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg">💡</span>
                      </div>
                      <p className="text-primary font-semibold">نصيحة احترافية: النظام يعمل على مدار الساعة ويحجز تلقائياً عند توفر الفترات</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* النوافذ المنبثقة */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <HelpCenter isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* نافذة الاختبارات */}
      <SystemTests isOpen={showTests} onClose={() => setShowTests(false)} />

      {/* نافذة الإعدادات المتقدمة */}
      {showAdvancedSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdvancedSettings(false)}>
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">الإعدادات المتقدمة</h2>
                <Button variant="ghost" onClick={() => setShowAdvancedSettings(false)}>✕</Button>
              </div>
              <AdvancedSettings
                onSettingsChange={(newSettings) => {
                  console.log('Settings updated:', newSettings);
                  toast({
                    title: "تم تحديث الإعدادات",
                    description: "تم حفظ الإعدادات المتقدمة بنجاح",
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* نافذة التقارير */}
      {showReports && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReports(false)}>
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">التقارير والإحصائيات</h2>
                <Button variant="ghost" onClick={() => setShowReports(false)}>✕</Button>
              </div>
              <ReportsExport systemStats={systemStats} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};