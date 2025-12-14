import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('الرسالة مطلوبة');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY غير متوفر');
    }

    console.log('استقبال رسالة:', message);

    const systemPrompt = `أنت مساعد ذكي متخصص في نظام حجز الروضة الشريفة. 

مهامك:
- الإجابة على استفسارات المستخدمين عن نظام الحجز
- شرح كيفية استخدام النظام والمراقبة الذكية
- مساعدة المستخدمين في حل المشاكل
- تقديم نصائح لتحسين فرص الحجز
- الإجابة بطريقة واضحة ومهذبة باللغة العربية

المعلومات المتاحة:
- النظام يوفر حجز تلقائي وذكي للروضة الشريفة
- يتضمن مراقبة مستمرة 24/7
- يوفر إشعارات فورية عند نجاح الحجز
- يحتوي على إحصائيات تفصيلية عن الأداء
- يدعم حجز عدة أشخاص في نفس الوقت
- يتميز بسرعة استجابة عالية ودقة في التنفيذ

كن مفيداً ومتعاوناً في إجاباتك.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('خطأ في استدعاء Lovable AI:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.');
      }
      if (response.status === 402) {
        throw new Error('يرجى إضافة رصيد لاستخدام البوت.');
      }
      
      throw new Error('خطأ في الاتصال بخدمة الذكاء الاصطناعي');
    }

    const data = await response.json();
    console.log('استجابة AI:', data);

    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('لم يتم الحصول على رد من البوت');
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('خطأ في chat-bot:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
