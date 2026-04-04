import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfessionalById, createBooking, sendBookingConfirmation } from "@/lib/api";
import {
  fetchPaymentSettings,
  createBookingHold,
  releaseBookingHold,
  createPayment,
  submitPaymentReceipt,
  uploadReceipt,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  PAYMENT_METHOD_GROUPS,
  type PaymentMethod,
  type PaymentSettings,
  type BookingHold,
} from "@/lib/payments";
import MobileLayout from "@/components/MobileLayout";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  MapPin,
  CalendarDays,
  Upload,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Timer,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
} from "lucide-react";

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  pago_movil: <Smartphone className="h-5 w-5" />,
  transferencia_bdv: <Building2 className="h-5 w-5" />,
  transferencia_mercantil: <Building2 className="h-5 w-5" />,
  binance: <Wallet className="h-5 w-5" />,
  tarjeta: <CreditCard className="h-5 w-5" />,
  zelle: <Wallet className="h-5 w-5" />,
};

type Currency = "VES" | "USD";

type Step = "select_method" | "payment_details" | "upload_receipt" | "processing" | "confirmed" | "error";

export default function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const professionalId = params.get("professional") || "";
  const dateStr = params.get("date") || "";
  const time = params.get("time") || "";
  const clientName = params.get("name") || "";
  const clientEmail = params.get("email") || "";
  const clientPhone = params.get("phone") || "";

  const [step, setStep] = useState<Step>("select_method");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hold, setHold] = useState<BookingHold | null>(null);
  const [holdTimeLeft, setHoldTimeLeft] = useState(0);

  const { data: professional } = useQuery({
    queryKey: ["professional", professionalId],
    queryFn: () => fetchProfessionalById(professionalId),
    enabled: !!professionalId,
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ["paymentSettings", professionalId],
    queryFn: () => fetchPaymentSettings(professionalId),
    enabled: !!professionalId,
  });

  // Create hold on mount
  useEffect(() => {
    if (!user || !professionalId || !dateStr || !time) return;
    let cancelled = false;

    createBookingHold({
      professional_id: professionalId,
      client_user_id: user.id,
      booking_date: dateStr,
      booking_time: time,
    })
      .then((h) => { if (!cancelled) setHold(h); })
      .catch((err) => {
        if (!cancelled) {
          toast({ title: "Horario no disponible", description: err.message, variant: "destructive" });
          navigate(-1);
        }
      });

    return () => {
      cancelled = true;
      // Release hold on unmount if not confirmed
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hold countdown timer
  useEffect(() => {
    if (!hold) return;
    const interval = setInterval(() => {
      const expiresAt = new Date(hold.expires_at).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setHoldTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (step !== "confirmed") {
          toast({ title: "Tiempo expirado", description: "El horario ha sido liberado.", variant: "destructive" });
          navigate(-1);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hold, step, navigate, toast]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isManualMethod = (method: PaymentMethod) =>
    ["pago_movil", "transferencia_bdv", "transferencia_mercantil", "zelle"].includes(method);

  const amount = professional?.price ?? 0;
  const displayAmount = currency === "VES" ? (amount * 36.5).toFixed(2) : amount.toFixed(2);
  const currencySymbol = currency === "VES" ? "Bs." : "$";

  const date = dateStr ? new Date(dateStr) : new Date();
  const formattedDate = date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const acceptedMethods = paymentSettings?.accepted_methods?.length
    ? paymentSettings.accepted_methods
    : (["pago_movil", "binance", "transferencia_bdv", "transferencia_mercantil", "tarjeta"] as PaymentMethod[]);

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (isManualMethod(method)) {
      setStep("payment_details");
    } else {
      // For automatic methods (binance, tarjeta) go straight to mock processing
      setStep("processing");
      simulateAutomaticPayment(method);
    }
  };

  const simulateAutomaticPayment = async (method: PaymentMethod) => {
    setSubmitting(true);
    try {
      // Create booking first
      const booking = await createBooking({
        professional_id: professionalId,
        client_user_id: user!.id,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || undefined,
        booking_date: dateStr,
        booking_time: time,
        duration: professional!.duration,
        price: professional!.price,
        currency: professional!.currency,
      });

      // Create payment record as paid
      await createPayment({
        booking_id: booking.id,
        professional_id: professionalId,
        client_user_id: user!.id,
        method,
        currency,
        amount,
      });

      // Release hold
      if (hold) await releaseBookingHold(hold.id).catch(() => {});

      // Send confirmation
      sendBookingConfirmation({
        client_name: clientName,
        client_email: clientEmail,
        professional_name: professional!.name,
        professional_specialty: professional!.specialty,
        booking_date: dateStr,
        booking_time: time,
        duration: professional!.duration,
        price: professional!.price,
        currency: professional!.currency,
        location: professional!.location ?? undefined,
      });

      // Simulate processing delay
      await new Promise((r) => setTimeout(r, 2000));
      setStep("confirmed");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile && !referenceNumber) {
      toast({ title: "Faltan datos", description: "Sube un comprobante o ingresa el número de referencia.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Create booking
      const booking = await createBooking({
        professional_id: professionalId,
        client_user_id: user!.id,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || undefined,
        booking_date: dateStr,
        booking_time: time,
        duration: professional!.duration,
        price: professional!.price,
        currency: professional!.currency,
      });

      let receiptUrl: string | undefined;
      if (receiptFile) {
        receiptUrl = await uploadReceipt(user!.id, receiptFile);
      }

      // Create payment as verifying
      await createPayment({
        booking_id: booking.id,
        professional_id: professionalId,
        client_user_id: user!.id,
        method: selectedMethod!,
        currency,
        amount,
        reference_number: referenceNumber || undefined,
        receipt_url: receiptUrl,
      });

      // Release hold
      if (hold) await releaseBookingHold(hold.id).catch(() => {});

      sendBookingConfirmation({
        client_name: clientName,
        client_email: clientEmail,
        professional_name: professional!.name,
        professional_specialty: professional!.specialty,
        booking_date: dateStr,
        booking_time: time,
        duration: professional!.duration,
        price: professional!.price,
        currency: professional!.currency,
        location: professional!.location ?? undefined,
      });

      setStep("confirmed");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!professional) {
    return (
      <MobileLayout title="Pago">
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <PageTransition>
      <MobileLayout title="Pago">
        <div className="container mx-auto max-w-2xl px-4 py-4 md:py-8 space-y-4">
          {/* Hold timer */}
          {hold && step !== "confirmed" && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
              holdTimeLeft <= 120 ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"
            }`}>
              <Timer className="h-4 w-4" />
              <span>Horario reservado por {formatTime(holdTimeLeft)}</span>
            </div>
          )}

          {/* Booking summary */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={professional.photo ?? "/placeholder.svg"}
                alt={professional.name}
                className="h-12 w-12 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <h2 className="font-display font-semibold truncate">{professional.name}</h2>
                <p className="text-sm text-muted-foreground">{professional.specialty}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm border-t border-border pt-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span className="capitalize">{formattedDate}</span>
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" /> {time} ({professional.duration} min)
              </span>
            </div>
          </div>

          {/* Currency selector */}
          {step === "select_method" && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Moneda</span>
                <div className="flex gap-2">
                  {(["USD", "VES"] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        currency === c
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {c === "USD" ? "🇺🇸 USD" : "🇻🇪 Bs."}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total a pagar</span>
                <span className="font-display text-2xl font-bold">
                  {currencySymbol}{displayAmount}
                </span>
              </div>
            </div>
          )}

          {/* Step: Select method */}
          {step === "select_method" && (
            <div className="space-y-4">
              {PAYMENT_METHOD_GROUPS.map((group) => {
                const available = group.methods.filter((m) => acceptedMethods.includes(m));
                if (available.length === 0) return null;
                return (
                  <div key={group.label} className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground px-1">{group.label}</h3>
                    <div className="space-y-2">
                      {available.map((method) => (
                        <button
                          key={method}
                          onClick={() => handleSelectMethod(method)}
                          className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:bg-accent transition-colors active:scale-[0.98]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                            {methodIcons[method]}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{PAYMENT_METHOD_LABELS[method]}</p>
                            <p className="text-xs text-muted-foreground">
                              {isManualMethod(method) ? "Verificación manual" : "Pago instantáneo"}
                            </p>
                          </div>
                          {!isManualMethod(method) && (
                            <Badge variant="secondary" className="text-xs">Automático</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step: Payment details (manual methods) */}
          {step === "payment_details" && selectedMethod && (
            <div className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep("select_method")}>← Volver</Button>
                <h3 className="font-display font-semibold">{PAYMENT_METHOD_LABELS[selectedMethod]}</h3>
              </div>

              {/* Payment data */}
              <div className="rounded-xl bg-muted p-4 space-y-2 text-sm">
                <p className="font-medium text-foreground">Datos para el pago</p>
                {selectedMethod === "pago_movil" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teléfono</span>
                      <span className="font-mono">{paymentSettings?.pago_movil_phone || "0412-1234567"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cédula</span>
                      <span className="font-mono">{paymentSettings?.pago_movil_cedula || "V-12345678"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Banco</span>
                      <span>{paymentSettings?.pago_movil_banco || "Banco de Venezuela"}</span>
                    </div>
                  </>
                )}
                {(selectedMethod === "transferencia_bdv" || selectedMethod === "transferencia_mercantil") && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Banco</span>
                      <span>{paymentSettings?.bank_name || (selectedMethod === "transferencia_bdv" ? "Banco de Venezuela" : "Mercantil")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cuenta</span>
                      <span className="font-mono">{paymentSettings?.bank_account_number || "0102-0000-00-0000000000"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Titular</span>
                      <span>{paymentSettings?.bank_account_name || professional.name}</span>
                    </div>
                  </>
                )}
                {selectedMethod === "zelle" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Zelle</span>
                    <span>{paymentSettings?.zelle_email || "pagos@ejemplo.com"}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-muted-foreground">Monto</span>
                  <span className="font-bold text-foreground">{currencySymbol}{displayAmount}</span>
                </div>
              </div>

              {/* Reference number */}
              <div className="space-y-2">
                <Label htmlFor="reference">Número de referencia</Label>
                <Input
                  id="reference"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Ej. 123456789"
                  className="h-12"
                />
              </div>

              {/* Receipt upload */}
              <div className="space-y-2">
                <Label>Comprobante de pago</Label>
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 hover:bg-muted/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {receiptFile ? receiptFile.name : "Toca para subir imagen o PDF"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <Button
                size="lg"
                className="w-full h-12"
                onClick={handleSubmitReceipt}
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar comprobante
              </Button>
            </div>
          )}

          {/* Step: Processing */}
          {step === "processing" && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <div>
                <h3 className="font-display text-xl font-bold">Procesando pago...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedMethod === "binance" ? "Conectando con Binance Pay" : "Procesando con pasarela de pago"}
                </p>
              </div>
            </div>
          )}

          {/* Step: Confirmed */}
          {step === "confirmed" && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">
                  {selectedMethod && isManualMethod(selectedMethod)
                    ? "¡Comprobante enviado!"
                    : "¡Pago confirmado!"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedMethod && isManualMethod(selectedMethod)
                    ? "El profesional revisará tu comprobante y confirmará la cita."
                    : "Tu cita ha sido confirmada exitosamente."}
                </p>
              </div>

              {selectedMethod && isManualMethod(selectedMethod) && (
                <div className="rounded-xl bg-accent p-3 text-sm">
                  <p className="flex items-center gap-2 text-accent-foreground">
                    <Clock className="h-4 w-4" />
                    Estado: <Badge variant="secondary">Pendiente de verificación</Badge>
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button variant="link" asChild><Link to="/my-bookings">Ver mis citas</Link></Button>
                <Button variant="link" asChild><Link to="/">Volver al inicio</Link></Button>
              </div>
            </div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-display text-xl font-bold">Error en el pago</h3>
                <p className="text-sm text-muted-foreground mt-1">Algo salió mal. Por favor intenta de nuevo.</p>
              </div>
              <Button onClick={() => setStep("select_method")}>Intentar de nuevo</Button>
            </div>
          )}
        </div>
      </MobileLayout>
    </PageTransition>
  );
}
