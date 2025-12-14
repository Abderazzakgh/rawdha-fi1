import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Crown, 
  Shield, 
  Zap 
} from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const steps = [
    { step: 'تهيئة النظام الذكي...', duration: 800 },
    { step: 'تحميل واجهة المستخدم المتقدمة...', duration: 600 },
    { step: 'إعداد آليات المراقبة...', duration: 700 },
    { step: 'تجهيز خوارزميات الحجز الذكي...', duration: 900 },
    { step: 'إنجاز التحضيرات النهائية...', duration: 500 }
  ];

  useEffect(() => {
    let currentProgress = 0;
    let stepIndex = 0;

    const runSteps = () => {
      if (stepIndex < steps.length) {
        const currentStepData = steps[stepIndex];
        setCurrentStep(currentStepData.step);
        
        const stepProgress = 100 / steps.length;
        const targetProgress = (stepIndex + 1) * stepProgress;
        
        const progressInterval = setInterval(() => {
          currentProgress += 2;
          setProgress(Math.min(currentProgress, targetProgress));
          
          if (currentProgress >= targetProgress) {
            clearInterval(progressInterval);
            stepIndex++;
            setTimeout(runSteps, 200);
          }
        }, currentStepData.duration / 50);
      } else {
        setTimeout(() => {
          setProgress(100);
          setTimeout(onComplete, 1000);
        }, 500);
      }
    };

    setTimeout(runSteps, 1000);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-radial from-primary/20 via-background to-secondary/10 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in">
        {/* Logo Area */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl animate-pulse-slow"></div>
          <div className="relative z-10 space-y-6">
            <div className="w-32 h-32 mx-auto bg-gradient-hero rounded-full flex items-center justify-center shadow-glow animate-float">
              <Crown className="h-16 w-16 text-white" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent animate-shimmer">
                الروضة الشريفة
              </h1>
              <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
              <p className="text-2xl font-medium text-muted-foreground">
                نظام الحجز الذكي والمراقبة المتقدمة
              </p>
            </div>
          </div>
        </div>

        {/* Features Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="outline" className="px-4 py-2 text-sm bg-gradient-primary/10 border-primary/30 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <Sparkles className="h-4 w-4 ml-1" />
            ذكاء اصطناعي
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm bg-gradient-secondary/10 border-secondary/30 animate-fade-in" style={{animationDelay: '0.7s'}}>
            <Shield className="h-4 w-4 ml-1" />
            أمان متقدم
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm bg-gradient-accent/10 border-accent/30 animate-fade-in" style={{animationDelay: '0.9s'}}>
            <Zap className="h-4 w-4 ml-1" />
            سرعة فائقة
          </Badge>
        </div>

        {/* Loading Section */}
        <Card className="mx-auto max-w-md bg-gradient-card border-primary/20 shadow-elegant animate-fade-in" style={{animationDelay: '1.2s'}}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">جاري التحميل...</span>
                <span className="text-primary font-bold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <p className="text-sm text-muted-foreground text-center animate-pulse">
              {currentStep}
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-xs text-muted-foreground animate-fade-in" style={{animationDelay: '1.5s'}}>
          <p>© 2024 نظام الروضة الشريفة الذكي - جميع الحقوق محفوظة</p>
          <p className="mt-1">تم التطوير بأحدث التقنيات للحج والعمرة</p>
        </div>
      </div>
    </div>
  );
};