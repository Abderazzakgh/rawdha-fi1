import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";

interface BookingSlot {
  id: string;
  time: string;
  date: string;
  capacity: number;
  available: boolean;
}

interface GroupMember {
  id: string;
  name: string;
  nationalId: string;
  selected: boolean;
}

export const BookingDashboard = () => {
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [groupNumber, setGroupNumber] = useState('');
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [autoBooking, setAutoBooking] = useState(false);
  const [bookingAttempts, setBookingAttempts] = useState(0);

  // Simulate monitoring data
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        setLastCheck(new Date());
        // Simulate random slot availability
        const mockSlots: BookingSlot[] = [
          {
            id: '1',
            time: '08:00 - 09:00',
            date: '2024-01-15',
            capacity: 50,
            available: Math.random() > 0.7
          },
          {
            id: '2', 
            time: '10:00 - 11:00',
            date: '2024-01-15',
            capacity: 50,
            available: Math.random() > 0.8
          },
          {
            id: '3',
            time: '14:00 - 15:00', 
            date: '2024-01-16',
            capacity: 50,
            available: Math.random() > 0.6
          }
        ];
        setAvailableSlots(mockSlots);
        
        // Auto booking logic
        if (autoBooking && mockSlots.some(slot => slot.available)) {
          const availableSlot = mockSlots.find(slot => slot.available);
          if (availableSlot) {
            setBookingAttempts(prev => prev + 1);
            toast({
              title: "محاولة حجز تلقائي",
              description: `محاولة حجز الفترة: ${availableSlot.time}`,
              variant: "default",
            });
          }
        }
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [isMonitoring, autoBooking, toast]);

  const handleGroupSearch = () => {
    if (!groupNumber) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم المجموعة",
        variant: "destructive",
      });
      return;
    }

    // Simulate group members data
    const mockMembers: GroupMember[] = [
      { id: '1', name: 'أحمد محمد علي', nationalId: '1234567890', selected: false },
      { id: '2', name: 'فاطمة أحمد السالم', nationalId: '0987654321', selected: false },
      { id: '3', name: 'محمد عبدالله النجار', nationalId: '1122334455', selected: false },
      { id: '4', name: 'عائشة سعد المطيري', nationalId: '5544332211', selected: false },
    ];
    
    setGroupMembers(mockMembers);
    toast({
      title: "تم العثور على المجموعة",
      description: `تم العثور على ${mockMembers.length} أشخاص في المجموعة`,
    });
  };

  const toggleMemberSelection = (memberId: string) => {
    setGroupMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, selected: !member.selected }
          : member
      )
    );
  };

  const selectedMembersCount = groupMembers.filter(m => m.selected).length;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            برنامج حجز الروضة الشريفة
          </h1>
          <p className="text-muted-foreground text-lg">
            نظام المراقبة والحجز التلقائي لمنصة نسك أعمال
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  لوحة التحكم
                </CardTitle>
                <CardDescription>
                  إعدادات المراقبة والحجز التلقائي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Group Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="group-number">رقم المجموعة</Label>
                  <div className="flex gap-2">
                    <Input
                      id="group-number"
                      value={groupNumber}
                      onChange={(e) => setGroupNumber(e.target.value)}
                      placeholder="أدخل رقم المجموعة"
                      className="flex-1"
                    />
                    <Button onClick={handleGroupSearch} variant="secondary">
                      بحث
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Monitoring Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">مراقبة الحجز</span>
                    <Button
                      variant={isMonitoring ? "destructive" : "default"}
                      size="sm"
                      onClick={() => setIsMonitoring(!isMonitoring)}
                      className="flex items-center gap-2"
                    >
                      {isMonitoring ? (
                        <>
                          <Pause className="h-4 w-4" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          بدء
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">الحجز التلقائي</span>
                    <Button
                      variant={autoBooking ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAutoBooking(!autoBooking)}
                      disabled={!isMonitoring}
                    >
                      {autoBooking ? "مفعل" : "معطل"}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Status Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>الحالة:</span>
                    <Badge variant={isMonitoring ? "default" : "secondary"}>
                      {isMonitoring ? "نشط" : "متوقف"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>آخر فحص:</span>
                    <span className="text-muted-foreground">
                      {lastCheck ? lastCheck.toLocaleTimeString('ar-SA') : 'لم يبدأ'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>محاولات الحجز:</span>
                    <Badge variant="outline">{bookingAttempts}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Slots */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  الفترات المتاحة
                  {isMonitoring && (
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  )}
                </CardTitle>
                <CardDescription>
                  الفترات المتاحة حالياً للحجز
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">لا توجد فترات متاحة حالياً</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-4 border rounded-lg flex items-center justify-between transition-all ${
                          slot.available
                            ? 'border-success bg-success/10'
                            : 'border-muted bg-muted/10'
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
                            <p className="text-sm text-muted-foreground">{slot.date}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge variant={slot.available ? "default" : "secondary"}>
                            {slot.available ? 'متاح' : 'مكتمل'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            السعة: {slot.capacity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Group Members */}
            {groupMembers.length > 0 && (
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    أعضاء المجموعة
                    <Badge variant="outline">{selectedMembersCount}/{groupMembers.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    اختر الأشخاص المراد الحجز لهم
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {groupMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          member.selected
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => toggleMemberSelection(member.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.nationalId}</p>
                          </div>
                          {member.selected && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{isMonitoring ? 'نشط' : 'متوقف'}</p>
              <p className="text-sm text-muted-foreground">حالة المراقبة</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-info" />
              <p className="text-2xl font-bold">{availableSlots.filter(s => s.available).length}</p>
              <p className="text-sm text-muted-foreground">فترات متاحة</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold">{selectedMembersCount}</p>
              <p className="text-sm text-muted-foreground">أشخاص محددين</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">{bookingAttempts}</p>
              <p className="text-sm text-muted-foreground">محاولات الحجز</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};