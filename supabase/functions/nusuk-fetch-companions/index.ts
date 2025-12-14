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
        const { accountId } = JSON.parse(body);

        console.log('Fetching companions for account:', accountId);

        // جلب معلومات الحساب
        const { data: account, error: accountError } = await supabaseClient
          .from('nusuk_accounts')
          .select('session_cookies')
          .eq('id', accountId)
          .single();

        if (accountError || !account) {
          throw new Error('الحساب غير موجود');
        }

        // محاولة جلب المرافقين من موقع نسك
        const companionsResponse = await fetch('https://masar.nusuk.sa/api/companions', {
          method: 'GET',
          headers: {
            'Cookie': account.session_cookies || '',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        console.log('Companions response status:', companionsResponse.status);

        let companions: any[] = [];

        if (companionsResponse.ok) {
          const data = await companionsResponse.json();
          companions = data.companions || [];

          // حفظ المرافقين في قاعدة البيانات
          for (const companion of companions) {
            await supabaseClient
              .from('nusuk_companions')
              .upsert(
                {
                  account_id: accountId,
                  companion_name: companion.name,
                  companion_id: companion.id,
                  is_selected: true,
                },
                { onConflict: 'account_id,companion_id' }
              );
          }
        }

        // إرسال الرد
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            companions: companions,
            count: companions.length,
          })
        );
      } catch (error: any) {
        console.error('Fetch companions error:', error);
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: false,
            error: error.message || 'فشل جلب المرافقين',
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
