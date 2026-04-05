INSERT INTO public.professional_payment_settings (
  professional_id,
  requires_prepayment,
  accepted_methods,
  currency_preference,
  pago_movil_phone,
  pago_movil_cedula,
  pago_movil_banco,
  binance_email,
  zelle_email
) VALUES (
  '385668f5-32ee-40de-889a-cf0b92d0a774',
  true,
  '{pago_movil,binance,zelle}',
  'USD',
  '+58 412 1234567',
  'V-12345678',
  'Banco de Venezuela',
  'maria.gonzalez@binance.com',
  'maria.gonzalez@gmail.com'
) ON CONFLICT (professional_id) DO UPDATE SET
  requires_prepayment = true,
  accepted_methods = EXCLUDED.accepted_methods,
  pago_movil_phone = EXCLUDED.pago_movil_phone,
  pago_movil_cedula = EXCLUDED.pago_movil_cedula,
  pago_movil_banco = EXCLUDED.pago_movil_banco,
  binance_email = EXCLUDED.binance_email,
  zelle_email = EXCLUDED.zelle_email;