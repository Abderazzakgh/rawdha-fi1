import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Zap,
  Users,
  CheckCircle,
  XCircle,
  Timer
} from "lucide-react";

interface SystemStatsProps {
  totalAttempts: number;
  successfulBookings: number;
  failedAttempts: number;
  averageResponseTime: number;
  uptime: string;
  successRate: number;
}

export const SystemStats = ({
  totalAttempts,
  successfulBookings,
  failedAttempts,
  averageResponseTime,
  uptime,
  successRate
}: SystemStatsProps) => {
  const stats = [
    {
      title: "إجمالي المحاولات",
      value: totalAttempts,
      icon: Target,
      color: "info",
      change: "+12% من الأمس"
    },
    {
      title: "حجوزات ناجحة",
      value: successfulBookings,
      icon: CheckCircle,
      color: "success",
      change: "+5 من آخر ساعة"
    },
    {
      title: "محاولات فاشلة",
      value: failedAttempts,
      icon: XCircle,
      color: "destructive",
      change: "-2% من الأمس"
    },
    {
      title: "متوسط زمن الاستجابة",
      value: `${averageResponseTime}ms`,
      icon: Timer,
      color: "warning",
      change: "محسن بـ 15%"
    }
  ];

  return (
    <div className="space-y-6">
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-card border-primary/20 hover:shadow-card transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                <Badge variant="outline" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* مؤشرات الأداء */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* معدل النجاح */}
        <Card className="bg-gradient-card border-primary/20 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-success" />
              معدل النجاح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>النجاح الإجمالي</span>
                <span className="font-bold">{successRate.toFixed(1)}%</span>
              </div>
              <Progress value={successRate} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>ضعيف</span>
                <span>ممتاز</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* وقت التشغيل */}
        <Card className="bg-gradient-card border-primary/20 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-info" />
              وقت التشغيل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{uptime}</p>
                <p className="text-sm text-muted-foreground">التشغيل المستمر</p>
              </div>
              <div className="flex justify-center">
                <Badge variant="default" className="animate-pulse">
                  نظام نشط
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل الأداء */}
      <Card className="bg-gradient-card border-primary/20 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            تحليل الأداء المفصل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xl font-bold">{successfulBookings}</p>
              <p className="text-xs text-muted-foreground">أشخاص محجوزين</p>
            </div>
            
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-success" />
              <p className="text-xl font-bold">{((successfulBookings / Math.max(totalAttempts, 1)) * 100).toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">دقة الاستهداف</p>
            </div>
            
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <Timer className="h-6 w-6 mx-auto mb-2 text-info" />
              <p className="text-xl font-bold">{averageResponseTime}ms</p>
              <p className="text-xs text-muted-foreground">متوسط الزمن</p>
            </div>
            
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-warning" />
              <p className="text-xl font-bold">+{Math.floor(Math.random() * 20 + 5)}%</p>
              <p className="text-xs text-muted-foreground">تحسن الأداء</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};