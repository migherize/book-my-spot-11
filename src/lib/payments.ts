import { supabase } from "@/integrations/supabase/client";

export type PaymentMethod = "pago_movil" | "transferencia_bdv" | "transferencia_mercantil" | "binance" | "tarjeta" | "zelle";
export type PaymentStatus = "pending" | "verifying" | "paid" | "rejected" | "expired";

export interface PaymentSettings {
  id: string;
  professional_id: string;
  requires_prepayment: boolean;
  accepted_methods: PaymentMethod[];
  currency_preference: string;
  pago_movil_phone: string | null;
  pago_movil_cedula: string | null;
  pago_movil_banco: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  bank_name: string | null;
  binance_email: string | null;
  zelle_email: string | null;
}

export interface Payment {
  id: string;
  booking_id: string;
  professional_id: string;
  client_user_id: string;
  method: PaymentMethod;
  currency: string;
  amount: number;
  status: PaymentStatus;
  receipt_url: string | null;
  reference_number: string | null;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface BookingHold {
  id: string;
  professional_id: string;
  client_user_id: string;
  booking_date: string;
  booking_time: string;
  expires_at: string;
  status: string;
}

// ===== Payment Settings =====
export async function fetchPaymentSettings(professionalId: string): Promise<PaymentSettings | null> {
  const { data, error } = await supabase
    .from("professional_payment_settings")
    .select("*")
    .eq("professional_id", professionalId)
    .maybeSingle();
  if (error) throw error;
  return data as PaymentSettings | null;
}

export async function upsertPaymentSettings(professionalId: string, settings: Partial<PaymentSettings>) {
  const { data, error } = await supabase
    .from("professional_payment_settings")
    .upsert({ professional_id: professionalId, ...settings }, { onConflict: "professional_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ===== Booking Holds =====
export async function createBookingHold(params: {
  professional_id: string;
  client_user_id: string;
  booking_date: string;
  booking_time: string;
}): Promise<BookingHold> {
  // Clean expired holds first
  await supabase.rpc("cleanup_expired_holds" as any);

  const { data, error } = await supabase
    .from("booking_holds")
    .insert({
      ...params,
      status: "active",
    })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("Este horario ya está bloqueado. Por favor elige otro.");
    }
    throw error;
  }
  return data as unknown as BookingHold;
}

export async function releaseBookingHold(holdId: string) {
  const { error } = await supabase
    .from("booking_holds")
    .update({ status: "expired" } as any)
    .eq("id", holdId);
  if (error) throw error;
}

// ===== Payments =====
export async function createPayment(params: {
  booking_id: string;
  professional_id: string;
  client_user_id: string;
  method: PaymentMethod;
  currency: string;
  amount: number;
  reference_number?: string;
  receipt_url?: string;
  notes?: string;
}): Promise<Payment> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 min to complete payment

  const { data, error } = await supabase
    .from("payments")
    .insert({
      ...params,
      status: "pending" as any,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Payment;
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus) {
  const { data, error } = await supabase
    .from("payments")
    .update({ status: status as any })
    .eq("id", paymentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function submitPaymentReceipt(paymentId: string, receiptUrl: string, referenceNumber?: string) {
  const { data, error } = await supabase
    .from("payments")
    .update({
      receipt_url: receiptUrl,
      reference_number: referenceNumber,
      status: "verifying" as any,
    })
    .eq("id", paymentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadReceipt(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("payment-receipts")
    .upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage
    .from("payment-receipts")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function fetchPaymentsByBooking(bookingId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Payment[];
}

// ===== Method display helpers =====
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pago_movil: "Pago Móvil",
  transferencia_bdv: "Banco de Venezuela",
  transferencia_mercantil: "Mercantil",
  binance: "Binance Pay",
  tarjeta: "Tarjeta de crédito/débito",
  zelle: "Zelle",
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  pago_movil: "📱",
  transferencia_bdv: "🏦",
  transferencia_mercantil: "🏦",
  binance: "💰",
  tarjeta: "💳",
  zelle: "💵",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  verifying: "Verificando",
  paid: "Pagado",
  rejected: "Rechazado",
  expired: "Expirado",
};

export type PaymentMethodGroup = {
  label: string;
  methods: PaymentMethod[];
};

export const PAYMENT_METHOD_GROUPS: PaymentMethodGroup[] = [
  { label: "Métodos rápidos", methods: ["pago_movil", "binance"] },
  { label: "Bancos", methods: ["transferencia_bdv", "transferencia_mercantil"] },
  { label: "Internacional", methods: ["tarjeta", "zelle"] },
];
