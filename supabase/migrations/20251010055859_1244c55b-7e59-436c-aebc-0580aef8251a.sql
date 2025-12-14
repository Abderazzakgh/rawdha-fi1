-- إصلاح مشكلة search_path في الدالة
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- إعادة إنشاء triggers
CREATE TRIGGER update_nusuk_accounts_updated_at
  BEFORE UPDATE ON public.nusuk_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_monitors_updated_at
  BEFORE UPDATE ON public.booking_monitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();