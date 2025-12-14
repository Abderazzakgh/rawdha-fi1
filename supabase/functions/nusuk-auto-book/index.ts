import http from "http";
import { createClient } from "@supabase/supabase-js";

// إعداد CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
};

// إنشاء عميل Supabase
const supabaseClient = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// إنشاء سيرفر Node
const server = http.createServer(async (req, res) => {
  // معالجة OPTIONS للـ CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { accountId, targetDate, slotId, companionIds } = JSON.parse(body);

        console.log('Starting auto-booking for:', targetDate);

        // جلب معلومات الحساب
        const { data: account, error: accountError } = await supabaseClient
          .from('nusuk_accounts')
          .select('session_cookies')
          .eq('id', accountId)
          .single();

        if (accountError || !account) {
          throw new Error('الحساب غير موجود');
        }

        // محاولة الحجز على موقع نسك
        const bookingResponse = await fetch('https://masar.nusuk.sa/api/booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': account.session_cookies || '',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body: JSON.stringify({
            date: targetDate,
            slotId: slotId,
            companions: companionIds
          })
        });

        console.log('Booking response status:', bookingResponse.status);

        let bookingSuccess = false;
        let bookingData = null;

        if (bookingResponse.ok) {
          try {
            bookingData = await bookingResponse.json();
            // Assume bookingData is an object and try to safely access 'success'
            if (bookingData && typeof bookingData === 'object' && 'success' in bookingData) {
              bookingSuccess = Boolean((bookingData as any).success);
            } else {
              bookingSuccess = false;
            }
          } catch (e) {
            bookingSuccess = false;
            bookingData = null;
          }
        }

        // تسجيل محاولة الحجز
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
              status: bookingSuccess ? 'booked' : 'failed',
              message: bookingSuccess ? 'تم الحجز بنجاح' : 'فشل الحجز'
            });

          // تحديث حالة المراقبة
          await supabaseClient
            .from('booking_monitors')
            .update({
              status: bookingSuccess ? 'completed' : 'failed',
              is_active: !bookingSuccess
            })
            .eq('id', monitor.id);
        }

        // إرسال الرد
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: bookingSuccess,
          message: bookingSuccess ? 'تم الحجز بنجاح' : 'فشل الحجز',
          bookingData: bookingData
        }));

      } catch (error: any) {
        console.error('Auto-booking error:', error);
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message || 'فشل الحجز التلقائي'
        }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// بدء السيرفر
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
