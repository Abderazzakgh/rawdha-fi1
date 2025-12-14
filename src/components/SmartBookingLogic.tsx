import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Timer,
  Target,
  Zap,
  Play,
  Pause
} from "lucide-react";
import { format, addDays, isWithinInterval } from "date-fns";
import { ar } from "date-fns/locale";

interface TimeSlot {
  id: string;
  time: string;
  date: Date;
  available: boolean;
  capacity: number;
  attemptCount: number;
}

interface BookingAttempt {
  id: string;
  timestamp: Date;
  peopleCount: number;
  success: boolean;
  error?: string;
}

interface SmartBookingLogicProps {
  entryDate: Date;
  exitDate: Date;
  selectedPeople: number;
  retryDelay: number;
  isActive: boolean;
}

export const SmartBookingLogic = ({ 
  entryDate, 
  exitDate, 
  selectedPeople, 
  retryDelay, 
  isActive 
}: SmartBookingLogicProps) => {
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookingAttempts, setBookingAttempts] = useState<BookingAttempt[]>([]);
  const [currentAttemptGroup, setCurrentAttemptGroup] = useState(selectedPeople);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [successfulBookings, setSuccessfulBookings] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [nextAttemptTime, setNextAttemptTime] = useState<Date | null>(null);
  const [autoStarted, setAutoStarted] = useState(false);

  // بدء المراقبة تلقائياً
  useEffect(() => {
    if (isActive && selectedPeople > 0 && !autoStarted && !isMonitoring) {
      setAutoStarted(true);
      setTimeout(() => {
        startMonitoring();
      }, 1000);
    }
  }, [isActive, selectedPeople, autoStarted, isMonitoring]);

  // إنشاء الفترات الزمنية المحتملة
  useEffect(() => {
    const slots: TimeSlot[] = [];
    const timeSlots = [
      '06:00', '06:20', '06:40', '07:00', '07:20', '07:40',
      '08:00', '08:20', '08:40', '09:00', '09:20', '09:40',
      '10:00', '10:20', '10:40', '11:00', '11:20', '11:40',
      '14:00', '14:20', '14:40', '15:00', '15:20', '15:40',
      '16:00', '16:20', '16:40', '17:00', '17:20', '17:40',
      '18:00', '18:20', '18:40', '19:00', '19:20', '19:40',
      '20:00', '20:20', '20:40', '21:00', '21:20', '21:40',
      '22:00', '22:20', '22:40', '23:00', '23:20', '23:40'
    ];

    // إنشاء فترات لجميع الأيام في النطاق المحدد
    let currentDate = new Date(entryDate);
    while (currentDate <= exitDate) {
      timeSlots.forEach((time, index) => {
        slots.push({
          id: `${format(currentDate, 'yyyy-MM-dd')}_${time}`,
          time,
          date: new Date(currentDate),
          available: Math.random() > 0.95, // محاكاة ندرة الفترات المتاحة
          capacity: 50,
          attemptCount: 0
        });
      });
      currentDate = addDays(currentDate, 1);
    }

    setTimeSlots(slots);
  }, [entryDate, exitDate]);

  // منطق المراقبة الذكي
  useEffect(() => {
    if (!isActive || !isMonitoring) return;

    const monitoringInterval = setInterval(() => {
      // محاكاة تحديث حالة الفترات
      setTimeSlots(prev => prev.map(slot => ({
        ...slot,
        available: Math.random() > 0.97 // فرصة أكبر قليلاً لإظهار فترات متاحة
      })));

      // البحث عن فترات متاحة والمحاولة
      const availableSlots = timeSlots.filter(slot => 
        slot.available && 
        isWithinInterval(slot.date, { start: entryDate, end: exitDate })
      );

      if (availableSlots.length > 0 && (!nextAttemptTime || new Date() >= nextAttemptTime)) {
        attemptBooking(availableSlots[0]);
      }
    }, 1000);

    return () => clearInterval(monitoringInterval);
  }, [isActive, isMonitoring, timeSlots, entryDate, exitDate, nextAttemptTime]);

  // محاولة الحجز مع منطق الأعداد الذكي
  const attemptBooking = async (slot: TimeSlot) => {
    const attemptId = `attempt_${Date.now()}`;
    setTotalAttempts(prev => prev + 1);

    // محاكاة محاولة الحجز
    const success = Math.random() > 0.7; // 30% معدل نجاح
    
    const attempt: BookingAttempt = {
      id: attemptId,
      timestamp: new Date(),
      peopleCount: currentAttemptGroup,
      success,
      error: success ? undefined : 'العدد المطلوب غير متاح'
    };

    setBookingAttempts(prev => [attempt, ...prev].slice(0, 10));

    if (success) {
      setSuccessfulBookings(prev => prev + currentAttemptGroup);
      setCurrentAttemptGroup(Math.max(0, selectedPeople - (successfulBookings + currentAttemptGroup)));
      
      toast({
        title: "نجح الحجز! 🎉",
        description: `تم حجز ${currentAttemptGroup} أشخاص للفترة ${slot.time} في ${format(slot.date, 'dd/MM/yyyy', { locale: ar })}`,
      });

      // إذا تم حجز الجميع، توقف المراقبة
      if (successfulBookings + currentAttemptGroup >= selectedPeople) {
        setIsMonitoring(false);
        toast({
          title: "اكتمل الحجز بنجاح! ✅",
          description: `تم حجز جميع الأشخاص (${selectedPeople}) بنجاح`,
        });
        return;
      }
    } else {
      // منطق تقليل العدد
      if (currentAttemptGroup > 1) {
        const newGroupSize = Math.max(1, Math.floor(currentAttemptGroup / 2));
        setCurrentAttemptGroup(newGroupSize);
        
        toast({
          title: "تعديل عدد الأشخاص",
          description: `سيتم المحاولة بـ ${newGroupSize} أشخاص في المرة القادمة`,
        });
      }
    }

    // تحديد موعد المحاولة التالية
    setNextAttemptTime(new Date(Date.now() + retryDelay * 1000));
    
    // تحديث إحصائيات الفترة
    setTimeSlots(prev => prev.map(s => 
      s.id === slot.id 
        ? { ...s, attemptCount: s.attemptCount + 1, available: false }
        : s
    ));
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    setCurrentAttemptGroup(selectedPeople);
    setBookingAttempts([]);
    setSuccessfulBookings(0);
    setTotalAttempts(0);
    
    toast({
      title: "بدأت المراقبة الذكية",
      description: `مراقبة الفترات المتاحة من ${format(entryDate, 'dd/MM/yyyy', { locale: ar })} إلى ${format(exitDate, 'dd/MM/yyyy', { locale: ar })}`,
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setNextAttemptTime(null);
    toast({
      title: "توقفت المراقبة",
      description: "تم إيقاف مراقبة الحجز",
    });
  };

  const remainingPeople = selectedPeople - successfulBookings;
  const completionPercentage = (successfulBookings / selectedPeople) * 100;

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            الخطوة الرابعة: منطق الحجز الذكي
          </CardTitle>
          <CardDescription>
            مراقبة الفترات المتاحة والحجز التلقائي مع تقليل الأعداد عند الحاجة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* إحصائيات المراقبة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{selectedPeople}</p>
              <p className="text-sm text-muted-foreground">العدد المطلوب</p>
            </Card>
            
            <Card className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-success">{successfulBookings}</p>
              <p className="text-sm text-muted-foreground">تم حجزهم</p>
            </Card>
            
            <Card className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold text-warning">{remainingPeople}</p>
              <p className="text-sm text-muted-foreground">متبقي</p>
            </Card>
            
            <Card className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-info" />
              <p className="text-2xl font-bold text-info">{totalAttempts}</p>
              <p className="text-sm text-muted-foreground">المحاولات</p>
            </Card>
          </div>

          {/* شريط التقدم */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>تقدم الحجز</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
          </div>

          <Separator />

          {/* حالة المراقبة الحالية */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5" />
              الحالة الحالية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">حالة المراقبة:</span>
                <Badge variant={isMonitoring ? "default" : "secondary"} className="block text-center">
                  {isMonitoring ? 'نشطة' : 'متوقفة'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">المجموعة الحالية:</span>
                <Badge variant="outline" className="block text-center">
                  {currentAttemptGroup} أشخاص
                </Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">المحاولة التالية:</span>
                <Badge variant="outline" className="block text-center text-xs">
                  {nextAttemptTime 
                    ? nextAttemptTime.toLocaleTimeString('ar-SA')
                    : 'فوري'
                  }
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* الفترات المتاحة حالياً */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              الفترات المراقبة ({timeSlots.filter(s => isWithinInterval(s.date, { start: entryDate, end: exitDate })).length})
            </h3>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {timeSlots
                .filter(slot => isWithinInterval(slot.date, { start: entryDate, end: exitDate }))
                .slice(0, 10)
                .map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                      slot.available
                        ? 'border-success bg-success/10 animate-glow'
                        : 'border-muted bg-background'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {slot.available ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{slot.time}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(slot.date, 'EEEE dd/MM/yyyy', { locale: ar })}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge variant={slot.available ? "default" : "secondary"}>
                        {slot.available ? 'متاح الآن!' : 'مكتمل'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        محاولات: {slot.attemptCount}
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <Separator />

          {/* سجل المحاولات الأخيرة */}
          {bookingAttempts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Timer className="h-5 w-5" />
                آخر المحاولات
              </h3>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bookingAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className={`p-3 border rounded-lg flex items-center justify-between ${
                      attempt.success
                        ? 'border-success bg-success/10'
                        : 'border-destructive bg-destructive/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {attempt.success ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {attempt.success ? 'نجح الحجز' : 'فشل الحجز'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.timestamp.toLocaleTimeString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge variant={attempt.success ? "default" : "destructive"}>
                        {attempt.peopleCount} أشخاص
                      </Badge>
                      {attempt.error && (
                        <p className="text-xs text-destructive mt-1">{attempt.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* أزرار التحكم */}
          <div className="space-y-4">
            {isMonitoring ? (
              <div className="p-6 bg-gradient-primary/10 border-2 border-primary/30 rounded-xl text-center space-y-3 animate-pulse-soft">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                  <Play className="h-8 w-8 text-primary-foreground animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-primary">المراقبة الذكية نشطة</h3>
                <p className="text-muted-foreground">النظام يعمل الآن على مدار الساعة للحجز التلقائي</p>
                <Button
                  onClick={stopMonitoring}
                  variant="destructive"
                  className="mt-4"
                >
                  <Pause className="h-4 w-4 ml-2" />
                  إيقاف المراقبة
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={startMonitoring}
                  disabled={remainingPeople === 0}
                  className="flex-1 bg-gradient-primary hover:bg-primary/90 shadow-elegant"
                  size="lg"
                >
                  <Play className="h-4 w-4 ml-2" />
                  بدء المراقبة الذكية
                </Button>
              </div>
            )}
          </div>

          {/* معلومات المنطق الذكي */}
          <Card className="p-4 border-info bg-info/10">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-info mt-1" />
              <div>
                <h4 className="font-semibold text-info mb-2">آلية الحجز الذكي</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• مراقبة مستمرة لجميع الفترات في النطاق المحدد (24/7)</li>
                  <li>• عند فشل الحجز لعدد كبير، يتم التقليل تدريجياً (10→5→2→1)</li>
                  <li>• إعادة المحاولة كل {retryDelay} ثانية حسب الإعدادات</li>
                  <li>• التوقف التلقائي عند اكتمال حجز جميع الأشخاص</li>
                  <li>• حفظ سجل مفصل لجميع المحاولات والنتائج</li>
                </ul>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};