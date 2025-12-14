-- إنشاء جدول لحفظ بيانات الحساب والجلسات
CREATE TABLE IF NOT EXISTS public.nusuk_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  session_cookies TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول لحفظ معلومات المرافقين
CREATE TABLE IF NOT EXISTS public.nusuk_companions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.nusuk_accounts(id) ON DELETE CASCADE,
  companion_name TEXT NOT NULL,
  companion_id TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول لمراقبة التوفر
CREATE TABLE IF NOT EXISTS public.booking_monitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.nusuk_accounts(id) ON DELETE CASCADE,
  target_date DATE NOT NULL,
  check_interval INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  last_check TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول لسجل المحاولات
CREATE TABLE IF NOT EXISTS public.booking_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monitor_id UUID REFERENCES public.booking_monitors(id) ON DELETE CASCADE,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.nusuk_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nusuk_companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_attempts ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للحسابات
CREATE POLICY "Users can view their own accounts"
  ON public.nusuk_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON public.nusuk_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON public.nusuk_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.nusuk_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- سياسات الأمان للمرافقين
CREATE POLICY "Users can view companions of their accounts"
  ON public.nusuk_companions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nusuk_accounts
      WHERE nusuk_accounts.id = nusuk_companions.account_id
      AND nusuk_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert companions to their accounts"
  ON public.nusuk_companions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nusuk_accounts
      WHERE nusuk_accounts.id = nusuk_companions.account_id
      AND nusuk_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update companions of their accounts"
  ON public.nusuk_companions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.nusuk_accounts
      WHERE nusuk_accounts.id = nusuk_companions.account_id
      AND nusuk_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete companions of their accounts"
  ON public.nusuk_companions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.nusuk_accounts
      WHERE nusuk_accounts.id = nusuk_companions.account_id
      AND nusuk_accounts.user_id = auth.uid()
    )
  );

-- سياسات الأمان للمراقبة
CREATE POLICY "Users can view their own monitors"
  ON public.booking_monitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nusuk_accounts
      WHERE nusuk_accounts.id = booking_monitors.account_id
      AND nusuk_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create monitors for their accounts"
  ON public.booking_monitors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nusuk_accounts
      WHERE nusuk_accounts.id = booking_monitors.account_id
      AND nusuk_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own monitors"
  ON public.booking_monitors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.nusuk_accounts
      WHERE nusuk_accounts.id = booking_monitors.account_id
      AND nusuk_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own monitors"
  ON public.booking_monitors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.nusuk_accounts
      WHERE nusuk_accounts.id = booking_monitors.account_id
      AND nusuk_accounts.user_id = auth.uid()
    )
  );

-- سياسات الأمان لسجل المحاولات
CREATE POLICY "Users can view attempts for their monitors"
  ON public.booking_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_monitors
      JOIN public.nusuk_accounts ON nusuk_accounts.id = booking_monitors.account_id
      WHERE booking_monitors.id = booking_attempts.monitor_id
      AND nusuk_accounts.user_id = auth.uid()
    )
  );

-- إضافة trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nusuk_accounts_updated_at
  BEFORE UPDATE ON public.nusuk_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_monitors_updated_at
  BEFORE UPDATE ON public.booking_monitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();