CREATE OR REPLACE FUNCTION public.activate_professional_account(
  p_professional_name TEXT,
  p_specialty TEXT,
  p_location TEXT,
  p_category_type public.category_type,
  p_subcategory_id TEXT,
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
  v_professional_id UUID;
  v_subcategory_category_type public.category_type;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF btrim(p_professional_name) = '' OR btrim(p_specialty) = '' OR btrim(p_location) = '' THEN
    RAISE EXCEPTION 'INVALID_ONBOARDING_DATA';
  END IF;

  SELECT category_type
  INTO v_subcategory_category_type
  FROM public.subcategories
  WHERE id = p_subcategory_id;

  IF v_subcategory_category_type IS NULL OR v_subcategory_category_type <> p_category_type THEN
    RAISE EXCEPTION 'INVALID_SUBCATEGORY';
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

  INSERT INTO public.professionals (
    user_id,
    name,
    specialty,
    location,
    description,
    category_type,
    subcategory_id,
    price,
    currency,
    duration,
    languages,
    modality,
    review_count,
    rating
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
    p_category_type,
    p_subcategory_id,
    0,
    'USD',
    30,
    ARRAY[]::TEXT[],
    ARRAY['presencial'::public.modality_type],
    0,
    0
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    name = EXCLUDED.name,
    specialty = EXCLUDED.specialty,
    location = EXCLUDED.location,
    description = EXCLUDED.description,
    category_type = EXCLUDED.category_type,
    subcategory_id = EXCLUDED.subcategory_id,
    updated_at = now()
  RETURNING id INTO v_professional_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'professional')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN v_professional_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_professional_booking_access(p_professional_id UUID)
RETURNS TABLE (
  professional_id UUID,
  accepting_bookings BOOLEAN,
  subscription_active BOOLEAN,
  free_booking_limit INTEGER,
  free_bookings_used INTEGER,
  free_bookings_remaining INTEGER,
  is_near_limit BOOLEAN,
  limit_reached BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS professional_id,
    COALESCE(pa.subscription_active, false) OR COALESCE(pa.free_bookings_used, 0) < COALESCE(pa.free_booking_limit, 5) AS accepting_bookings,
    COALESCE(pa.subscription_active, false) AS subscription_active,
    COALESCE(pa.free_booking_limit, 5) AS free_booking_limit,
    COALESCE(pa.free_bookings_used, 0) AS free_bookings_used,
    GREATEST(COALESCE(pa.free_booking_limit, 5) - COALESCE(pa.free_bookings_used, 0), 0) AS free_bookings_remaining,
    (NOT COALESCE(pa.subscription_active, false)) AND COALESCE(pa.free_bookings_used, 0) = GREATEST(COALESCE(pa.free_booking_limit, 5) - 1, 0) AS is_near_limit,
    (NOT COALESCE(pa.subscription_active, false)) AND COALESCE(pa.free_bookings_used, 0) >= COALESCE(pa.free_booking_limit, 5) AS limit_reached
  FROM public.professionals p
  LEFT JOIN public.professional_accounts pa ON pa.user_id = p.user_id
  WHERE p.id = p_professional_id;
$$;