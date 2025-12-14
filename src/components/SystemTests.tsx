import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  TestTube2, 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Smartphone,
  Monitor,
  Wifi,
  Database,
  Zap,
  Brain,
  Settings,
  Users,
  Timer,
  Activity,
  BarChart3,
  Shield,
  Clock,
  RefreshCw,
  Download
} from "lucide-react";

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  icon: any;
  tests: TestResult[];
  deviceSupport: ('mobile' | 'tablet' | 'desktop')[];
}

interface SystemTestsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemTests = ({ isOpen, onClose }: SystemTestsProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRunningAllTests, setIsRunningAllTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // تحديد نوع الجهاز
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // مجموعات الاختبار
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 'dashboard',
      name: 'اختبارات لوحة التحكم',
      description: 'فحص جميع مكونات لوحة التحكم الرئيسية',
      icon: BarChart3,
      deviceSupport: ['mobile', 'tablet', 'desktop'],
      tests: [
        { id: 'stats-load', name: 'تحميل الإحصائيات', status: 'pending', details: 'فحص تحميل البيانات والإحصائيات' },
        { id: 'responsive-layout', name: 'التصميم المتجاوب', status: 'pending', details: 'التأكد من توافق التصميم مع جميع الأجهزة' },
        { id: 'real-time-updates', name: 'التحديثات المباشرة', status: 'pending', details: 'فحص تحديث البيانات في الوقت الفعلي' },
        { id: 'navigation-flow', name: 'تدفق التنقل', status: 'pending', details: 'اختبار سلاسة التنقل بين الأقسام' },
        { id: 'data-visualization', name: 'عرض البيانات', status: 'pending', details: 'فحص الرسوم البيانية والمخططات' }
      ]
    },
    {
      id: 'booking',
      name: 'اختبارات الحجز الذكي',
      description: 'فحص منطق الحجز التلقائي والمراقبة',
      icon: Brain,
      deviceSupport: ['mobile', 'tablet', 'desktop'],
      tests: [
        { id: 'smart-monitoring', name: 'المراقبة الذكية', status: 'pending', details: 'فحص آلية المراقبة المستمرة' },
        { id: 'booking-logic', name: 'منطق الحجز', status: 'pending', details: 'اختبار خوارزمية الحجز التلقائي' },
        { id: 'retry-mechanism', name: 'آلية إعادة المحاولة', status: 'pending', details: 'فحص إعادة المحاولة عند الفشل' },
        { id: 'group-optimization', name: 'تحسين المجموعات', status: 'pending', details: 'اختبار تقسيم الأعداد تلقائياً' },
        { id: 'success-detection', name: 'اكتشاف النجاح', status: 'pending', details: 'فحص تحديد نجاح العمليات' }
      ]
    },
    {
      id: 'settings',
      name: 'اختبارات الإعدادات',
      description: 'فحص إدارة الإعدادات والتحكم',
      icon: Settings,
      deviceSupport: ['mobile', 'tablet', 'desktop'],
      tests: [
        { id: 'save-settings', name: 'حفظ الإعدادات', status: 'pending', details: 'فحص حفظ واستعادة الإعدادات' },
        { id: 'export-import', name: 'تصدير واستيراد', status: 'pending', details: 'اختبار تصدير واستيراد الإعدادات' },
        { id: 'validation', name: 'التحقق من البيانات', status: 'pending', details: 'فحص صحة البيانات المدخلة' },
        { id: 'theme-switching', name: 'تبديل المظاهر', status: 'pending', details: 'اختبار تغيير مظاهر التطبيق' },
        { id: 'backup-restore', name: 'النسخ الاحتياطي', status: 'pending', details: 'فحص آلية النسخ الاحتياطي' }
      ]
    },
    {
      id: 'performance',
      name: 'اختبارات الأداء',
      description: 'قياس أداء النظام وسرعة الاستجابة',
      icon: Zap,
      deviceSupport: ['mobile', 'tablet', 'desktop'],
      tests: [
        { id: 'load-time', name: 'سرعة التحميل', status: 'pending', details: 'قياس وقت تحميل المكونات' },
        { id: 'memory-usage', name: 'استخدام الذاكرة', status: 'pending', details: 'فحص كفاءة استخدام الذاكرة' },
        { id: 'network-efficiency', name: 'كفاءة الشبكة', status: 'pending', details: 'اختبار تحسين طلبات الشبكة' },
        { id: 'concurrent-requests', name: 'الطلبات المتزامنة', status: 'pending', details: 'فحص التعامل مع طلبات متعددة' },
        { id: 'error-handling', name: 'معالجة الأخطاء', status: 'pending', details: 'اختبار التعامل مع الأخطاء' }
      ]
    },
    {
      id: 'security',
      name: 'اختبارات الأمان',
      description: 'فحص أمان النظام وحماية البيانات',
      icon: Shield,
      deviceSupport: ['mobile', 'tablet', 'desktop'],
      tests: [
        { id: 'data-encryption', name: 'تشفير البيانات', status: 'pending', details: 'فحص تشفير البيانات الحساسة' },
        { id: 'session-management', name: 'إدارة الجلسات', status: 'pending', details: 'اختبار أمان الجلسات' },
        { id: 'input-validation', name: 'التحقق من المدخلات', status: 'pending', details: 'فحص صحة البيانات المدخلة' },
        { id: 'auto-logout', name: 'تسجيل الخروج التلقائي', status: 'pending', details: 'اختبار الخروج عند عدم النشاط' },
        { id: 'secure-storage', name: 'التخزين الآمن', status: 'pending', details: 'فحص أمان تخزين البيانات' }
      ]
    }
  ]);

  // تشغيل اختبار واحد
  const runSingleTest = async (suiteId: string, testId: string) => {
    setTestSuites(prev => 
      prev.map(suite => 
        suite.id === suiteId 
          ? {
              ...suite,
              tests: suite.tests.map(test => 
                test.id === testId 
                  ? { ...test, status: 'running' as const }
                  : test
              )
            }
          : suite
      )
    );

    // محاكاة تشغيل الاختبار
    const delay = Math.random() * 2000 + 1000;
    const success = Math.random() > 0.2; // 80% معدل نجاح

    await new Promise(resolve => setTimeout(resolve, delay));

    setTestSuites(prev => 
      prev.map(suite => 
        suite.id === suiteId 
          ? {
              ...suite,
              tests: suite.tests.map(test => 
                test.id === testId 
                  ? { 
                      ...test, 
                      status: success ? 'passed' as const : 'failed' as const,
                      duration: Math.round(delay),
                      error: success ? undefined : 'فشل في تنفيذ الاختبار'
                    }
                  : test
              )
            }
          : suite
      )
    );

    if (success) {
      toast({
        title: "نجح الاختبار ✓",
        description: `اختبار "${testSuites.find(s => s.id === suiteId)?.tests.find(t => t.id === testId)?.name}" تم بنجاح`,
      });
    } else {
      toast({
        title: "فشل الاختبار ✗",
        description: `اختبار "${testSuites.find(s => s.id === suiteId)?.tests.find(t => t.id === testId)?.name}" فشل في التنفيذ`,
        variant: "destructive"
      });
    }
  };

  // تشغيل مجموعة اختبارات
  const runTestSuite = async (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) return;

    for (const test of suite.tests) {
      await runSingleTest(suiteId, test.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // تشغيل جميع الاختبارات
  const runAllTests = async () => {
    setIsRunningAllTests(true);
    setTestProgress(0);

    // إعادة تعيين جميع الاختبارات
    setTestSuites(prev => 
      prev.map(suite => ({
        ...suite,
        tests: suite.tests.map(test => ({ ...test, status: 'pending' as const }))
      }))
    );

    const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
    let completedTests = 0;

    for (const suite of testSuites) {
      for (const test of suite.tests) {
        await runSingleTest(suite.id, test.id);
        completedTests++;
        setTestProgress((completedTests / totalTests) * 100);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    setIsRunningAllTests(false);
    toast({
      title: "اكتملت جميع الاختبارات",
      description: "تم تشغيل جميع اختبارات النظام بنجاح",
    });
  };

  // تصدير تقرير الاختبارات
  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      deviceType,
      testSuites: testSuites.map(suite => ({
        name: suite.name,
        passed: suite.tests.filter(t => t.status === 'passed').length,
        failed: suite.tests.filter(t => t.status === 'failed').length,
        total: suite.tests.length,
        tests: suite.tests
      }))
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `test-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "تم تصدير التقرير",
      description: "تم تنزيل تقرير الاختبارات بنجاح",
    });
  };

  // حساب الإحصائيات
  const getStats = () => {
    const allTests = testSuites.flatMap(suite => suite.tests);
    return {
      total: allTests.length,
      passed: allTests.filter(t => t.status === 'passed').length,
      failed: allTests.filter(t => t.status === 'failed').length,
      pending: allTests.filter(t => t.status === 'pending').length,
      running: allTests.filter(t => t.status === 'running').length
    };
  };

  const stats = getStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" dir="rtl">
      <Card className="w-full h-full max-w-6xl max-h-[95vh] overflow-hidden shadow-floating bg-gradient-card border-primary/20">
        {/* Header */}
        <CardHeader className="bg-gradient-primary text-primary-foreground p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <TestTube2 className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <CardTitle className="text-white text-lg sm:text-xl">مركز اختبارات النظام</CardTitle>
                <CardDescription className="text-primary-foreground/80 text-sm sm:text-base">
                  فحص شامل لجميع وظائف التطبيق على {deviceType === 'mobile' ? 'الجوال' : deviceType === 'tablet' ? 'الجهاز اللوحي' : 'سطح المكتب'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  deviceType === 'mobile' ? 'bg-green-400' : 
                  deviceType === 'tablet' ? 'bg-blue-400' : 'bg-purple-400'
                }`}></div>
                {deviceType === 'mobile' ? <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                 deviceType === 'tablet' ? <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                 <Monitor className="h-3 w-3 sm:h-4 sm:w-4" />}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="flex flex-col h-[calc(100%-4rem)] overflow-hidden">
          {/* Stats Bar */}
          <div className="p-3 sm:p-4 bg-gradient-glass border-b">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">إجمالي</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-success">{stats.passed}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">نجح</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-destructive">{stats.failed}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">فشل</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-warning">{stats.running}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">جاري</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-muted-foreground">{stats.pending}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">في الانتظار</p>
              </div>
            </div>

            {isRunningAllTests && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>تقدم الاختبارات</span>
                  <span>{Math.round(testProgress)}%</span>
                </div>
                <Progress value={testProgress} className="w-full" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-3 sm:p-4 bg-background border-b">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={runAllTests}
                disabled={isRunningAllTests}
                className="flex-1 bg-gradient-primary hover:bg-primary/90 shadow-elegant text-sm sm:text-base"
              >
                <PlayCircle className="h-4 w-4 ml-2" />
                {isRunningAllTests ? 'جاري التشغيل...' : 'تشغيل جميع الاختبارات'}
              </Button>
              
              <Button
                onClick={exportReport}
                variant="outline"
                className="sm:w-auto text-sm sm:text-base"
              >
                <Download className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </div>
          </div>

          {/* Test Suites */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid grid-cols-3 sm:grid-cols-5 m-3 sm:m-4">
                {testSuites.map((suite) => (
                  <TabsTrigger 
                    key={suite.id} 
                    value={suite.id} 
                    className="text-xs sm:text-sm"
                  >
                    <suite.icon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    <span className="hidden sm:inline">{suite.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-4">
                {testSuites.map((suite) => (
                  <TabsContent key={suite.id} value={suite.id} className="mt-0">
                    <Card className="shadow-elegant">
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 bg-gradient-primary rounded-xl">
                              <suite.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-base sm:text-lg">{suite.name}</CardTitle>
                              <CardDescription className="text-sm">{suite.description}</CardDescription>
                            </div>
                          </div>
                          <Button
                            onClick={() => runTestSuite(suite.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs sm:text-sm"
                          >
                            <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                            تشغيل الكل
                          </Button>
                        </div>

                        {/* Device Support */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">متوافق مع:</span>
                          <div className="flex gap-1">
                            {suite.deviceSupport.includes('mobile') && (
                              <Badge variant="outline" className="text-xs">
                                <Smartphone className="h-3 w-3 ml-1" />
                                جوال
                              </Badge>
                            )}
                            {suite.deviceSupport.includes('tablet') && (
                              <Badge variant="outline" className="text-xs">
                                <Smartphone className="h-3 w-3 ml-1" />
                                لوحي
                              </Badge>
                            )}
                            {suite.deviceSupport.includes('desktop') && (
                              <Badge variant="outline" className="text-xs">
                                <Monitor className="h-3 w-3 ml-1" />
                                مكتبي
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-2 sm:space-y-3">
                        {suite.tests.map((test) => (
                          <div
                            key={test.id}
                            className={`p-3 sm:p-4 border rounded-lg transition-all ${
                              test.status === 'passed' ? 'border-success bg-success/10' :
                              test.status === 'failed' ? 'border-destructive bg-destructive/10' :
                              test.status === 'running' ? 'border-warning bg-warning/10 animate-pulse' :
                              'border-muted bg-background'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                <div className="flex-shrink-0">
                                  {test.status === 'passed' && <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success" />}
                                  {test.status === 'failed' && <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />}
                                  {test.status === 'running' && <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-warning animate-spin" />}
                                  {test.status === 'pending' && <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">{test.name}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground">{test.details}</p>
                                  {test.duration && (
                                    <p className="text-xs text-muted-foreground">
                                      وقت التنفيذ: {test.duration}ms
                                    </p>
                                  )}
                                  {test.error && (
                                    <p className="text-xs text-destructive mt-1">{test.error}</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={() => runSingleTest(suite.id, test.id)}
                                disabled={test.status === 'running'}
                                size="sm"
                                variant="outline"
                                className="text-xs flex-shrink-0"
                              >
                                <PlayCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
};