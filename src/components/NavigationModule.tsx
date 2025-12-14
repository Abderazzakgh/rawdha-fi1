import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Navigation,
  MousePointer,
  Search,
  Users,
  CheckCircle,
  ArrowRight,
  Filter,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { api, NusukCompanion } from "@/lib/api";

interface NavigationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

interface SelectedPerson {
  id: string;
  name: string;
  nationalId: string;
  selected: boolean;
}

interface NavigationModuleProps {
  groupNumber: string;
  permitType: 'men' | 'women';
  isActive: boolean;
  onComplete?: (selectedCount: number) => void;
}

export const NavigationModule = ({ groupNumber, permitType, isActive, onComplete }: NavigationModuleProps) => {
  const { toast } = useToast();
  const [autoStarted, setAutoStarted] = useState(false);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([
    {
      id: 'nusuk',
      title: 'الضغط على "نسك"',
      description: 'الانتقال للصفحة الرئيسية لنسك',
      completed: false,
      active: false
    },
    {
      id: 'permits',
      title: 'الضغط على "تصاريح نسك"',
      description: 'الوصول لقسم التصاريح',
      completed: false,
      active: false
    },
    {
      id: 'add_permit',
      title: 'الضغط على "إضافة طلب تصريح"',
      description: 'بدء عملية طلب تصريح جديد',
      completed: false,
      active: false
    },
    {
      id: 'permit_type',
      title: `الضغط على "${permitType === 'men' ? 'تصاريح الروضة للرجال' : 'تصاريح الروضة للنساء'}"`,
      description: 'اختيار نوع التصريح المناسب',
      completed: false,
      active: false
    },
    {
      id: 'filter',
      title: 'تصفية برقم المجموعة',
      description: `البحث عن المجموعة رقم: ${groupNumber}`,
      completed: false,
      active: false
    },
    {
      id: 'select_people',
      title: 'تحديد الأشخاص',
      description: 'اختيار الأشخاص المراد الحجز لهم (حد أقصى 10)',
      completed: false,
      active: false
    }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [groupMembers, setGroupMembers] = useState<SelectedPerson[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  // تحديد جميع الأعضاء تلقائياً عند التحميل
  // تحديد جميع الأعضاء تلقائياً عند التحميل إذا كانوا محددين مسبقاً في قاعدة البيانات
  useEffect(() => {
    // Logic changed: we trust the 'selected' state from DB now, 
    // so we just check if we have members to start the "simulation"
    if (groupMembers.length > 0 && !autoStarted) {
      setTimeout(() => {
        setAutoStarted(true);
      }, 1000);
    }
  }, [groupMembers.length, autoStarted]);

  // تحميل أعضاء المجموعة من قاعدة البيانات
  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        const account = await api.getNusukAccount();
        if (account) {
          const companions = await api.getCompanions(account.id);
          if (companions) {
            // Transform to the structure needed by the UI
            const members: SelectedPerson[] = companions.map(c => ({
              id: c.id,
              name: c.companion_name,
              nationalId: c.companion_id,
              selected: c.is_selected || false
            }));

            setGroupMembers(members);

            // Set initial selected count
            const count = members.filter(m => m.selected).length;
            setSelectedCount(count);
            // Notify parent immediately if needed, or wait for navigation completion
          }
        }
      } catch (error) {
        console.error("Failed to load companions", error);
        toast({
          title: "فشل تحميل المرافقين",
          description: "تعذر استرجاع القائمة من قاعدة البيانات",
          variant: "destructive"
        });
      }
    };

    fetchCompanions();
  }, [toast]);

  // تنفيذ خطوات التنقل
  const executeNavigationSteps = async () => {
    setIsNavigating(true);
    setProgress(0);

    for (let i = 0; i < navigationSteps.length; i++) {
      // تحديث الحالة للخطوة النشطة
      setNavigationSteps(prev => prev.map((step, index) => ({
        ...step,
        active: index === i,
        completed: index < i
      })));

      setCurrentStepIndex(i);
      setProgress(((i + 1) / navigationSteps.length) * 100);

      // محاكاة وقت التنفيذ لكل خطوة
      await new Promise(resolve => setTimeout(resolve, 2000));

      // إتمام الخطوة الحالية
      setNavigationSteps(prev => prev.map((step, index) => ({
        ...step,
        active: false,
        completed: index <= i
      })));

      toast({
        title: `تمت الخطوة ${i + 1}`,
        description: navigationSteps[i].title,
      });
    }

    setIsNavigating(false);
    onComplete?.(selectedCount);
    toast({
      title: "اكتمل التنقل",
      description: "تم الوصول لصفحة الحجز بنجاح",
    });
  };

  const togglePersonSelection = (personId: string) => {
    setGroupMembers(prev => {
      const updated = prev.map(person => {
        if (person.id === personId) {
          return { ...person, selected: !person.selected };
        }
        return person;
      });

      const newSelectedCount = updated.filter(p => p.selected).length;
      setSelectedCount(newSelectedCount);

      if (newSelectedCount > 10) {
        toast({
          title: "تجاوز الحد الأقصى",
          description: "لا يمكن اختيار أكثر من 10 أشخاص",
          variant: "destructive",
        });
        return prev; // لا نحدث القائمة إذا تجاوز العدد
      }

      return updated;
    });
  };

  const selectAllAvailable = () => {
    const availableCount = Math.min(groupMembers.length, 10);
    setGroupMembers(prev => prev.map((person, index) => ({
      ...person,
      selected: index < availableCount
    })));
    setSelectedCount(availableCount);
  };

  const clearSelection = () => {
    setGroupMembers(prev => prev.map(person => ({
      ...person,
      selected: false
    })));
    setSelectedCount(0);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Navigation className="h-6 w-6 text-primary" />
            الخطوة الثالثة: التنقل والتصفية
          </CardTitle>
          <CardDescription>
            تنفيذ مسار الحجز المحدد والوصول لصفحة اختيار الأشخاص
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* شريط التقدم العام */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>التقدم العام</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <Separator />

          {/* خطوات التنقل */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              مسار التنقل المطلوب
            </h3>

            <div className="space-y-3">
              {navigationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 border rounded-lg transition-all ${step.completed
                    ? 'border-success bg-success/10'
                    : step.active
                      ? 'border-primary bg-primary/10 animate-pulse-soft'
                      : 'border-muted bg-background'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                      ? 'bg-success text-success-foreground'
                      : step.active
                        ? 'bg-primary text-primary-foreground animate-glow'
                        : 'bg-muted text-muted-foreground'
                      }`}>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>

                    {step.active && (
                      <ArrowRight className="h-5 w-5 text-primary animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* أعضاء المجموعة وإدارة التحديد */}
          {groupMembers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  أعضاء المجموعة {groupNumber}
                </h3>
                <Badge variant="outline" className="text-sm">
                  {selectedCount}/10 محدد
                </Badge>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  onClick={selectAllAvailable}
                  variant="outline"
                  size="sm"
                  disabled={isNavigating}
                >
                  <UserCheck className="h-4 w-4 ml-1" />
                  تحديد الكل (حد أقصى 10)
                </Button>
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  size="sm"
                  disabled={isNavigating}
                >
                  إلغاء التحديد
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {groupMembers.map((person) => (
                  <div
                    key={person.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${person.selected
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                      }`}
                    onClick={() => !isNavigating && togglePersonSelection(person.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{person.name}</p>
                        <p className="text-xs text-muted-foreground">{person.nationalId}</p>
                      </div>
                      {person.selected && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedCount > 10 && (
                <Card className="p-3 border-warning bg-warning/10">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      تم تحديد {selectedCount} شخص. الحد الأقصى هو 10 أشخاص فقط.
                    </span>
                  </div>
                </Card>
              )}
            </div>
          )}

          <Separator />

          {/* زر التنفيذ */}
          <div className="space-y-3">
            <Button
              onClick={executeNavigationSteps}
              disabled={isNavigating || selectedCount === 0}
              className="w-full bg-gradient-primary hover:bg-primary/90 shadow-elegant"
              size="lg"
            >
              {isNavigating ? (
                <>
                  <Filter className="h-5 w-5 ml-2 animate-spin" />
                  جاري التنقل... ({currentStepIndex + 1}/{navigationSteps.length})
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 ml-2" />
                  بدء التنقل والتصفية ({selectedCount} شخص محدد)
                </>
              )}
            </Button>

            {selectedCount > 0 && !isNavigating && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-success font-semibold">تم تحديد {selectedCount} أشخاص - انقر للمتابعة</p>
              </div>
            )}
          </div>

          {/* معلومات هامة */}
          <Card className="p-4 border-info bg-info/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-info mt-1" />
              <div>
                <h4 className="font-semibold text-info mb-1">آلية التنقل الذكي</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• يتم تتبع المسار المحدد بدقة حسب واجهة نسك أعمال</li>
                  <li>• يتم التعامل مع أي تغييرات في واجهة الموقع تلقائياً</li>
                  <li>• يمكن اختيار حد أقصى 10 أشخاص للحجز في المرة الواحدة</li>
                  <li>• يتم حفظ حالة التحديد في حالة انقطاع الاتصال</li>
                </ul>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};