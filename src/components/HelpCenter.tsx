import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Video, 
  Phone, 
  Mail,
  Search,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenter = ({ isOpen, onClose }: HelpCenterProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      id: '1',
      question: 'كيف يعمل النظام الذكي لحجز الروضة الشريفة؟',
      answer: 'النظام يراقب باستمرار المنصة الرسمية لنسك أعمال ويحجز تلقائياً عند توفر الفترات. يستخدم خوارزميات ذكية لتحسين فرص النجاح.',
      category: 'system',
      priority: 'high'
    },
    {
      id: '2',
      question: 'هل النظام آمن لاستخدام بيانات حسابي؟',
      answer: 'نعم، النظام يستخدم تشفير متقدم ولا يحفظ بياناتك على خوادم خارجية. جميع البيانات محلية وآمنة 100%.',
      category: 'security',
      priority: 'high'
    },
    {
      id: '3',
      question: 'كم عدد الأشخاص التي يمكن حجزها في المرة الواحدة؟',
      answer: 'يمكن حجز حتى 10 أشخاص في المرة الواحدة. النظام يقلل العدد تلقائياً إذا لم تتوفر الفترات للعدد الكامل.',
      category: 'booking',
      priority: 'medium'
    },
    {
      id: '4',
      question: 'ماذا أفعل إذا لم يعمل النظام بشكل صحيح؟',
      answer: 'تأكد من اتصال الإنترنت وصحة بيانات تسجيل الدخول. يمكنك إعادة تشغيل النظام أو التواصل مع الدعم الفني.',
      category: 'troubleshooting',
      priority: 'medium'
    },
    {
      id: '5',
      question: 'هل يمكن استخدام النظام على أجهزة متعددة؟',
      answer: 'نعم، يمكن استخدام النظام على أي جهاز يدعم المتصفحات الحديثة. لكن تجنب تشغيله على أجهزة متعددة بنفس الحساب.',
      category: 'system',
      priority: 'low'
    },
    {
      id: '6',
      question: 'كيف أتأكد من نجاح عملية الحجز؟',
      answer: 'ستظهر إشعارات فورية عند نجاح الحجز، كما يمكنك التحقق من منصة نسك أعمال مباشرة لتأكيد الحجز.',
      category: 'booking',
      priority: 'high'
    }
  ];

  const tutorials = [
    {
      title: 'دليل البدء السريع',
      description: 'تعلم كيفية إعداد النظام والبدء في المراقبة',
      duration: '5 دقائق',
      type: 'video'
    },
    {
      title: 'شرح الإعدادات المتقدمة',
      description: 'تخصيص النظام للحصول على أفضل النتائج',
      duration: '8 دقائق',
      type: 'article'
    },
    {
      title: 'حل المشاكل الشائعة',
      description: 'طرق حل أكثر المشاكل شيوعاً',
      duration: '6 دقائق',
      type: 'guide'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSupportSubmit = () => {
    if (!supportForm.name || !supportForm.email || !supportForm.subject || !supportForm.message) {
      toast({
        title: "حقول مطلوبة",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // محاكاة إرسال الرسالة
    toast({
      title: "تم إرسال رسالتك",
      description: "سنتواصل معك خلال 24 ساعة",
    });

    setSupportForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-elegant bg-gradient-card border-primary/20">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-6 w-6" />
              <div>
                <CardTitle className="text-white">مركز المساعدة</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  الأسئلة الشائعة والدعم الفني
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* البحث والتصفية */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث في الأسئلة الشائعة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'system', label: 'النظام' },
                    { id: 'booking', label: 'الحجز' },
                    { id: 'security', label: 'الأمان' },
                    { id: 'troubleshooting', label: 'حل المشاكل' }
                  ].map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* الأسئلة الشائعة */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  الأسئلة الشائعة ({filteredFaqs.length})
                </h3>
                
                <Accordion type="single" collapsible className="space-y-3">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-right hover:no-underline py-4">
                        <div className="flex items-start gap-3 text-right">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {faq.priority === 'high' && <AlertTriangle className="h-4 w-4 text-warning" />}
                              {faq.priority === 'medium' && <Info className="h-4 w-4 text-info" />}
                              {faq.priority === 'low' && <CheckCircle className="h-4 w-4 text-success" />}
                              <Badge variant="outline" className="text-xs">
                                {faq.category === 'system' && 'النظام'}
                                {faq.category === 'booking' && 'الحجز'}
                                {faq.category === 'security' && 'الأمان'}
                                {faq.category === 'troubleshooting' && 'حل المشاكل'}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{faq.question}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-right pb-4">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* الدروس التعليمية */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  الدروس التعليمية
                </h3>
                
                <div className="grid gap-4">
                  {tutorials.map((tutorial, index) => (
                    <Card key={index} className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{tutorial.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{tutorial.description}</p>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                {tutorial.type === 'video' && '📹 فيديو'}
                                {tutorial.type === 'article' && '📄 مقال'}
                                {tutorial.type === 'guide' && '📋 دليل'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{tutorial.duration}</span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* التواصل والدعم */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  تواصل معنا
                </h3>
                
                <div className="space-y-3">
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium">الدعم الهاتفي</p>
                        <p className="text-sm text-muted-foreground">متاح 24/7</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-info" />
                      <div>
                        <p className="font-medium">البريد الإلكتروني</p>
                        <p className="text-sm text-muted-foreground">رد خلال 24 ساعة</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium">الدردشة المباشرة</p>
                        <p className="text-sm text-muted-foreground">إجابة فورية</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* نموذج التواصل */}
              <div>
                <h4 className="font-semibold mb-4">أرسل رسالة</h4>
                <div className="space-y-3">
                  <div>
                    <Input
                      placeholder="الاسم"
                      value={supportForm.name}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={supportForm.email}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Input
                      placeholder="موضوع الرسالة"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Textarea
                      placeholder="اكتب رسالتك هنا..."
                      rows={4}
                      value={supportForm.message}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSupportSubmit}
                    className="w-full bg-gradient-primary hover:bg-primary/90"
                  >
                    إرسال الرسالة
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};