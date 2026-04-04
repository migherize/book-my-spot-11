import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchPaymentSettings,
  upsertPaymentSettings,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/payments";
import MobileLayout from "@/components/MobileLayout";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, CreditCard } from "lucide-react";

const ALL_METHODS: PaymentMethod[] = [
  "pago_movil",
  "transferencia_bdv",
  "transferencia_mercantil",
  "binance",
  "tarjeta",
  "zelle",
];

export default function PaymentSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get professional ID for this user
  const { data: professional, isLoading: loadingPro } = useQuery({
    queryKey: ["myProfessional", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("professionals")
        .select("id")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["paymentSettings", professional?.id],
    queryFn: () => fetchPaymentSettings(professional!.id),
    enabled: !!professional?.id,
  });

  const [requiresPrepayment, setRequiresPrepayment] = useState(false);
  const [acceptedMethods, setAcceptedMethods] = useState<PaymentMethod[]>([]);
  const [currencyPreference, setCurrencyPreference] = useState("USD");
  const [pagoMovilPhone, setPagoMovilPhone] = useState("");
  const [pagoMovilCedula, setPagoMovilCedula] = useState("");
  const [pagoMovilBanco, setPagoMovilBanco] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [binanceEmail, setBinanceEmail] = useState("");
  const [zelleEmail, setZelleEmail] = useState("");

  useEffect(() => {
    if (!settings) return;
    setRequiresPrepayment(settings.requires_prepayment);
    setAcceptedMethods(settings.accepted_methods ?? []);
    setCurrencyPreference(settings.currency_preference ?? "USD");
    setPagoMovilPhone(settings.pago_movil_phone ?? "");
    setPagoMovilCedula(settings.pago_movil_cedula ?? "");
    setPagoMovilBanco(settings.pago_movil_banco ?? "");
    setBankAccountNumber(settings.bank_account_number ?? "");
    setBankAccountName(settings.bank_account_name ?? "");
    setBankName(settings.bank_name ?? "");
    setBinanceEmail(settings.binance_email ?? "");
    setZelleEmail(settings.zelle_email ?? "");
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () =>
      upsertPaymentSettings(professional!.id, {
        requires_prepayment: requiresPrepayment,
        accepted_methods: acceptedMethods as any,
        currency_preference: currencyPreference,
        pago_movil_phone: pagoMovilPhone || null,
        pago_movil_cedula: pagoMovilCedula || null,
        pago_movil_banco: pagoMovilBanco || null,
        bank_account_number: bankAccountNumber || null,
        bank_account_name: bankAccountName || null,
        bank_name: bankName || null,
        binance_email: binanceEmail || null,
        zelle_email: zelleEmail || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentSettings"] });
      toast({ title: "Guardado", description: "Configuración de pago actualizada." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const toggleMethod = (method: PaymentMethod) => {
    setAcceptedMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  if (loadingPro || loadingSettings) {
    return (
      <MobileLayout title="Configuración de pagos">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MobileLayout>
    );
  }

  if (!professional) {
    return (
      <MobileLayout title="Configuración de pagos">
        <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-bold">No eres profesional aún</h1>
          <p className="mt-2 text-muted-foreground">Activa tu perfil profesional para configurar pagos.</p>
          <Button className="mt-4" onClick={() => navigate("/professional-onboarding")}>
            Convertirme en profesional
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <PageTransition>
      <MobileLayout title="Configuración de pagos">
        <div className="container mx-auto max-w-2xl px-4 py-4 md:py-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Configuración de pagos</h1>
              <p className="text-sm text-muted-foreground">Define cómo quieres recibir pagos de tus clientes</p>
            </div>
          </div>

          {/* Prepayment toggle */}
          <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Requerir pago anticipado</p>
                <p className="text-sm text-muted-foreground">
                  Los clientes deberán pagar antes de confirmar la cita
                </p>
              </div>
              <Switch checked={requiresPrepayment} onCheckedChange={setRequiresPrepayment} />
            </div>
          </div>

          {requiresPrepayment && (
            <>
              {/* Currency preference */}
              <div className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-3">
                <p className="font-medium">Moneda preferida</p>
                <div className="flex gap-2">
                  {["USD", "VES"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrencyPreference(c)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        currencyPreference === c
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {c === "USD" ? "🇺🇸 USD" : "🇻🇪 Bolívares"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accepted methods */}
              <div className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-4">
                <p className="font-medium">Métodos aceptados</p>
                <div className="space-y-3">
                  {ALL_METHODS.map((method) => (
                    <div key={method} className="flex items-center gap-3">
                      <Checkbox
                        checked={acceptedMethods.includes(method)}
                        onCheckedChange={() => toggleMethod(method)}
                      />
                      <Label className="cursor-pointer" onClick={() => toggleMethod(method)}>
                        {PAYMENT_METHOD_LABELS[method]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pago Móvil details */}
              {acceptedMethods.includes("pago_movil") && (
                <div className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-4">
                  <p className="font-medium">📱 Datos de Pago Móvil</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>Teléfono</Label>
                      <Input value={pagoMovilPhone} onChange={(e) => setPagoMovilPhone(e.target.value)} placeholder="0412-1234567" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Cédula</Label>
                      <Input value={pagoMovilCedula} onChange={(e) => setPagoMovilCedula(e.target.value)} placeholder="V-12345678" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Banco</Label>
                      <Input value={pagoMovilBanco} onChange={(e) => setPagoMovilBanco(e.target.value)} placeholder="Banco de Venezuela" className="h-11" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank transfer details */}
              {(acceptedMethods.includes("transferencia_bdv") || acceptedMethods.includes("transferencia_mercantil")) && (
                <div className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-4">
                  <p className="font-medium">🏦 Datos bancarios</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>Banco</Label>
                      <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Banco de Venezuela" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Número de cuenta</Label>
                      <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="0102-0000-00-0000000000" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Titular</Label>
                      <Input value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} placeholder="Nombre del titular" className="h-11" />
                    </div>
                  </div>
                </div>
              )}

              {/* Binance */}
              {acceptedMethods.includes("binance") && (
                <div className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-3">
                  <p className="font-medium">💰 Binance Pay</p>
                  <div className="space-y-1.5">
                    <Label>Email de Binance</Label>
                    <Input value={binanceEmail} onChange={(e) => setBinanceEmail(e.target.value)} placeholder="tu@binance.com" className="h-11" />
                  </div>
                </div>
              )}

              {/* Zelle */}
              {acceptedMethods.includes("zelle") && (
                <div className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-3">
                  <p className="font-medium">💵 Zelle</p>
                  <div className="space-y-1.5">
                    <Label>Email de Zelle</Label>
                    <Input value={zelleEmail} onChange={(e) => setZelleEmail(e.target.value)} placeholder="pagos@ejemplo.com" className="h-11" />
                  </div>
                </div>
              )}
            </>
          )}

          <Button
            size="lg"
            className="w-full h-12"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar configuración
          </Button>
        </div>
      </MobileLayout>
    </PageTransition>
  );
}
