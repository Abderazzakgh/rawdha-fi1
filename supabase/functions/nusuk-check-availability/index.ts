import http from 'http';
import { createClient } from '@supabase/supabase-js';

// إعداد CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
};

// إنشاء عميل Supabase
const supabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// إنشاء السيرفر
const server = http.createServer(async (req, res) => {
  // معالجة OPTIONS للـ CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { accountId, targetDate } = JSON.parse(body);

        console.log('Checking availability for:', targetDate);

        // جلب معلومات الحساب
        const { data: account, error: accountError } = await supabaseClient
          .from('nusuk_accounts')
          .select('session_cookies')
          .eq('id', accountId)
          .single();

        if (accountError || !account) {
          throw new Error('الحساب غير موجود');
        }

        // التحقق من التوفر على موقع نسك
        const availabilityResponse = await fetch(
          `https://masar.nusuk.sa/api/availability?date=${targetDate}`,
          {
            method: 'GET',
            headers: {
              'Cookie': account.session_cookies || '',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        );

        console.log('Availability response status:', availabilityResponse.status);

        let isAvailable = false;
        let slots: any[] = [];

        if (availabilityResponse.ok) {
          const data = await availabilityResponse.json();
          isAvailable = data.available || false;
          slots = data.slots || [];
        }

        // تسجيل محاولة التحقق
        const { data: monitor } = await supabaseClient
          .from('booking_monitors')
          .select('id')
          .eq('account_id', accountId)
          .eq('target_date', targetDate)
          .single();

        if (monitor) {
          await supabaseClient
            .from('booking_attempts')
            .insert({
              monitor_id: monitor.id,
              status: isAvailable ? 'available' : 'not_available',
              message: isAvailable
                ? `تم العثور على ${slots.length} موعد متاح`
                : 'لا توجد مواعيد متاحة',
            });

          await supabaseClient
            .from('booking_monitors')
            .update({
              last_check: new Date().toISOString(),
              status: isAvailable ? 'available' : 'monitoring',
            })
            .eq('id', monitor.id);
        }

        // إرسال الرد
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            available: isAvailable,
            slots: slots,
            checkedAt: new Date().toISOString(),
          })
        );
      } catch (error: any) {
        console.error('Check availability error:', error);
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: false,
            error: error.message || 'فشل التحقق من التوفر',
          })
        );
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
