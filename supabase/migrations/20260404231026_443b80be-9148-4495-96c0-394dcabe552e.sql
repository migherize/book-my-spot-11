
-- Payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'verifying', 'paid', 'rejected', 'expired');

-- Payment method enum
CREATE TYPE public.payment_method AS ENUM ('pago_movil', 'transferencia_bdv', 'transferencia_mercantil', 'binance', 'tarjeta', 'zelle');

-- Professional payment settings
CREATE TABLE public.professional_payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  requires_prepayment BOOLEAN NOT NULL DEFAULT false,
  accepted_methods public.payment_method[] NOT NULL DEFAULT '{}',
  currency_preference TEXT NOT NULL DEFAULT 'USD',
  -- Pago móvil data
  pago_movil_phone TEXT,
  pago_movil_cedula TEXT,
  pago_movil_banco TEXT,
  -- Bank transfer data
  bank_account_number TEXT,
  bank_account_name TEXT,
  bank_name TEXT,
  -- Binance
  binance_email TEXT,
  -- Zelle
  zelle_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(professional_id)
);

ALTER TABLE public.professional_payment_settings ENABLE ROW LEVEL SECURITY;

-- Professionals can manage their own settings
CREATE POLICY "Professionals can view own payment settings"
  ON public.professional_payment_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals p
      WHERE p.id = professional_payment_settings.professional_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own payment settings"
  ON public.professional_payment_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals p
      WHERE p.id = professional_payment_settings.professional_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own payment settings"
  ON public.professional_payment_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.professionals p
      WHERE p.id = professional_payment_settings.professional_id
      AND p.user_id = auth.uid()
    )
  );

-- Clients can view payment settings to know how to pay
CREATE POLICY "Anyone can view payment settings"
  ON public.professional_payment_settings FOR SELECT
  USING (true);

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id),
  client_user_id UUID NOT NULL,
  method public.payment_method NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  amount NUMERIC NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  receipt_url TEXT,
  reference_number TEXT,
  notes TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can create payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_user_id);

CREATE POLICY "Clients can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (auth.uid() = client_user_id);

CREATE POLICY "Professionals can view their payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals p
      WHERE p.id = payments.professional_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update payment status"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals p
      WHERE p.id = payments.professional_id
      AND p.user_id = auth.uid()
    )
  );

-- Booking holds (slot blocking)
CREATE TABLE public.booking_holds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id),
  client_user_id UUID NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(professional_id, booking_date, booking_time, status)
);

ALTER TABLE public.booking_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active holds"
  ON public.booking_holds FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create holds"
  ON public.booking_holds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_user_id);

CREATE POLICY "Users can update own holds"
  ON public.booking_holds FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_user_id);

-- Function to clean expired holds
CREATE OR REPLACE FUNCTION public.cleanup_expired_holds()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.booking_holds
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < now();
$$;

-- Function to check if a slot is held
CREATE OR REPLACE FUNCTION public.is_slot_held(
  p_professional_id UUID,
  p_date DATE,
  p_time TIME
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.booking_holds
    WHERE professional_id = p_professional_id
    AND booking_date = p_date
    AND booking_time = p_time
    AND status = 'active'
    AND expires_at > now()
  );
$$;

-- Function to expire payments
CREATE OR REPLACE FUNCTION public.expire_pending_payments()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.payments
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < now();
$$;

-- Trigger for updated_at on payments
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on professional_payment_settings
CREATE TRIGGER update_professional_payment_settings_updated_at
  BEFORE UPDATE ON public.professional_payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false);

CREATE POLICY "Users can upload their own receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Professionals can view payment receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-receipts');
