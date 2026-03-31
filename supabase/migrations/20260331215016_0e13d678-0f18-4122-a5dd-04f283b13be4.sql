CREATE TABLE public.professional_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  professional_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  free_booking_limit INTEGER NOT NULL DEFAULT 5,
  free_bookings_used INTEGER NOT NULL DEFAULT 0,
  subscription_active BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.professional_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own professional account"
ON public.professional_accounts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own professional account"
ON public.professional_accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_professional_accounts_updated_at
BEFORE UPDATE ON public.professional_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.activate_professional_account(
  p_professional_name TEXT,
  p_specialty TEXT,
  p_location TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_account_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF btrim(p_professional_name) = '' OR btrim(p_specialty) = '' OR btrim(p_location) = '' THEN
    RAISE EXCEPTION 'INVALID_ONBOARDING_DATA';
  END IF;

  INSERT INTO public.professional_accounts (
    user_id,
    professional_name,
    specialty,
    location,
    description,
    free_booking_limit,
    free_bookings_used,
    subscription_active,
    onboarding_completed
  )
  VALUES (
    v_user_id,
    left(btrim(p_professional_name), 120),
    left(btrim(p_specialty), 120),
    left(btrim(p_location), 160),
    CASE
      WHEN p_description IS NULL OR btrim(p_description) = '' THEN NULL
      ELSE left(btrim(p_description), 500)
    END,
    5,
    0,
    false,
    true
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    professional_name = EXCLUDED.professional_name,
    specialty = EXCLUDED.specialty,
    location = EXCLUDED.location,
    description = EXCLUDED.description,
    onboarding_completed = true,
    updated_at = now()
  RETURNING id INTO v_account_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'professional')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN v_account_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_professional_booking_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_user_id UUID;
  v_account_id UUID;
  v_subscription_active BOOLEAN;
  v_free_booking_limit INTEGER;
  v_free_bookings_used INTEGER;
BEGIN
  SELECT user_id
  INTO v_owner_user_id
  FROM public.professionals
  WHERE id = NEW.professional_id;

  IF v_owner_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id, subscription_active, free_booking_limit, free_bookings_used
  INTO v_account_id, v_subscription_active, v_free_booking_limit, v_free_bookings_used
  FROM public.professional_accounts
  WHERE user_id = v_owner_user_id
  FOR UPDATE;

  IF NOT FOUND OR v_subscription_active OR v_free_booking_limit IS NULL THEN
    RETURN NEW;
  END IF;

  IF v_free_bookings_used >= v_free_booking_limit THEN
    RAISE EXCEPTION 'FREE_BOOKING_LIMIT_REACHED'
      USING DETAIL = 'This professional has reached the free booking limit and needs a subscription.';
  END IF;

  UPDATE public.professional_accounts
  SET free_bookings_used = free_bookings_used + 1,
      updated_at = now()
  WHERE id = v_account_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_professional_booking_limit_before_insert ON public.bookings;

CREATE TRIGGER enforce_professional_booking_limit_before_insert
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.enforce_professional_booking_limit();