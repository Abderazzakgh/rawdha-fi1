import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { 
  FileDown, 
  FileText, 
  BarChart3, 
  Calendar as CalendarIcon,
  Download,
  CheckCircle,
  Clock,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ReportsExportProps {
  systemStats: any;
}

export const ReportsExport = ({ systemStats }: ReportsExportProps) => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const reportTypes = [
    { value: 'summary', label: 'تقرير ملخص', icon: FileText },
    { value: 'detailed', label: 'تقرير مفصل', icon: BarChart3 },
    { value: 'activity', label: 'سجل النشاط', icon: Activity },
    { value: 'performance', label: 'تقرير الأداء', icon: CheckCircle }
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    setProgress(0);

    // محاكاة عملية توليد التقرير
    const steps = [
      'جمع البيانات...',
      'تحليل الإحصائيات...',
      'إنشاء الرسوم البيانية...',
      'تنسيق التقرير...',
      'إنهاء التحضير...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(((i + 1) / steps.length) * 100);
    }

    setIsGenerating(false);
    setProgress(100);

    // محاكاة تحميل الملف
    const reportData = {
      type: reportType,
      dateRange,
      generatedAt: new Date(),
      stats: systemStats,
      summary: {
        totalBookings: systemStats.successfulBookings,
        successRate: systemStats.successRate,
        totalAttempts: systemStats.totalAttempts,
        averageTime: systemStats.averageResponseTime
      }
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `rawdah-report-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "تم إنشاء التقرير",
      description: "تم تحميل التقرير بنجاح",
    });
  };

  const quickReports = [
    {
      title: "تقرير اليوم",
      description: "إحصائيات اليوم الحالي",
      value: "today",
      stats: { attempts: 45, success: 12, rate: "85%" }
    },
    {
      title: "تقرير الأسبوع",
      description: "إحصائيات آخر 7 أيام",
      value: "week",
      stats: { attempts: 234, success: 67, rate: "78%" }
    },
    {
      title: "تقرير الشهر",
      description: "إحصائيات آخر 30 يوماً",
      value: "month",
      stats: { attempts: 1250, success: 245, rate: "82%" }
    }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="bg-gradient-card border-primary/20 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileDown className="h-6 w-6 text-primary" />
            تصدير التقارير والإحصائيات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* التقارير السريعة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">التقارير السريعة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickReports.map((report) => (
                <Card key={report.value} className="p-4 cursor-pointer hover:shadow-md transition-all hover:scale-105">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{report.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {report.stats.rate}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <div className="flex justify-between text-xs">
                      <span>{report.stats.attempts} محاولة</span>
                      <span>{report.stats.success} نجح</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setReportType('summary');
                        generateReport();
                      }}
                    >
                      <Download className="h-3 w-3 ml-1" />
                      تحميل
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* التقارير المخصصة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">تقرير مخصص</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع التقرير</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع التقرير" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">نطاق التاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-right">
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, 'dd/MM/yyyy', { locale: ar })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ar })}`
                        ) : (
                          format(dateRange.from, 'dd/MM/yyyy', { locale: ar })
                        )
                      ) : (
                        <span>اختر النطاق الزمني</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => range && setDateRange(range as any)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 animate-spin" />
                  جاري إنشاء التقرير...
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <Button
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full bg-gradient-primary hover:bg-primary/90 shadow-button"
            >
              {isGenerating ? (
                <>
                  <Clock className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 ml-2" />
                  إنشاء وتحميل التقرير
                </>
              )}
            </Button>
          </div>

          {/* معاينة التقرير */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">معاينة البيانات</h3>
            <Card className="p-4 bg-background/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{systemStats.totalAttempts}</p>
                  <p className="text-xs text-muted-foreground">إجمالي المحاولات</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{systemStats.successfulBookings}</p>
                  <p className="text-xs text-muted-foreground">حجوزات ناجحة</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-info">{systemStats.successRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">معدل النجاح</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{systemStats.averageResponseTime}ms</p>
                  <p className="text-xs text-muted-foreground">متوسط الاستجابة</p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};