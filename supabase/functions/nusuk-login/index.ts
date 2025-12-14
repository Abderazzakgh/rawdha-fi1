import http from 'http';
import { createClient } from '@supabase/supabase-js';

// إعداد CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
};

// إنشاء Supabase client
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
        const { username, password, accountId } = JSON.parse(body);

        console.log('Starting login process for:', username);

        // تسجيل الدخول إلى موقع نسك
        const loginResponse = await fetch('https://masar.nusuk.sa/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          body: JSON.stringify({
            email: username,
            password: password,
          }),
        });

        console.log('Login response status:', loginResponse.status);

        // استخراج cookies من الاستجابة
        const setCookieHeaders = loginResponse.headers.get('set-cookie');
        console.log('Received cookies:', setCookieHeaders ? 'Yes' : 'No');

        // تحديث الحساب في قاعدة البيانات
        const { error: updateError } = await supabaseClient
          .from('nusuk_accounts')
          .update({
            session_cookies: setCookieHeaders || '',
            last_login: new Date().toISOString(),
            is_active: true,
          })
          .eq('id', accountId);

        if (updateError) {
          console.error('Error updating account:', updateError);
          throw updateError;
        }

        // إرسال الرد
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            hasSession: !!setCookieHeaders,
          })
        );
      } catch (error: any) {
        console.error('Login error:', error);
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: false,
            error: error.message || 'فشل تسجيل الدخول',
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
