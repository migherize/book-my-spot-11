import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, CheckCircle2, Crown, Sparkles, UserRoundCheck } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { categories } from "@/data/mockData";

export default function ProfessionalOnboarding() {
  const navigate = useNavigate();
  const {
    user,
    loading,
    profile,
    professionalState,
    professionalMockTemplate,
    activateProfessionalProfile,
    simulateProfessionalBooking,
    activateProfessionalSubscription,
    resetProfessionalProgress,
  } = useAuth();
  const { toast } = useToast();
  const [professionalName, setProfessionalName] = useState(profile?.full_name ?? professionalMockTemplate.professionalName);
  const [specialty, setSpecialty] = useState(professionalMockTemplate.specialty);
  const [location, setLocation] = useState(professionalMockTemplate.location);
  const [description, setDescription] = useState(professionalMockTemplate.description);
  const [categoryType, setCategoryType] = useState<"health" | "beauty" | "wellness">(professionalMockTemplate.categoryType);
  const [subcategoryId, setSubcategoryId] = useState(professionalMockTemplate.subcategoryId);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (professionalState || !profile?.full_name) return;
    setProfessionalName((current) => current === professionalMockTemplate.professionalName ? profile.full_name ?? current : current);
  }, [professionalMockTemplate.professionalName, professionalState, profile?.full_name]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.type === categoryType) ?? categories[0],
    [categoryType],
  );

  const mockPayload = {
    professionalStatus: professionalState ?? {
      userId: user?.id ?? "demo-user",
      ...professionalMockTemplate,
    },
  };

  const freeLimit = professionalState?.freeBookingLimit ?? 5;
  const freeUsed = professionalState?.freeBookingsUsed ?? 0;
  const freeRemaining = Math.max(freeLimit - freeUsed, 0);
  const isNearLimit = !professionalState?.subscriptionActive && freeUsed === freeLimit - 1;
  const isLimitReached = !professionalState?.subscriptionActive && freeUsed >= freeLimit;
  const progressValue = professionalState?.subscriptionActive ? 100 : (freeUsed / freeLimit) * 100;

  const handleActivateProfessional = () => {
    if (!user) {
      navigate("/auth?mode=signup&redirect=/professional-onboarding");
      return;
    }

    if (!professionalName.trim() || !specialty.trim() || !location.trim() || !subcategoryId || !acceptedTerms) {
      toast({
        title: "Completa el onboarding",
        description: "Rellena los datos básicos y acepta los términos para activar tu perfil profesional.",
        variant: "destructive",
      });
      return;
    }

    activateProfessionalProfile({
      professionalName: professionalName.trim(),
      specialty: specialty.trim(),
      location: location.trim(),
      description: description.trim(),
      categoryType,
      subcategoryId,
    });

    toast({
      title: "Perfil profesional activado",
      description: "Tu onboarding mock quedó listo con 5 citas gratis para probar el flujo.",
    });
  };

  const handleSimulateBooking = () => {
    const updated = simulateProfessionalBooking();
    if (!updated) return;

    if (!updated.subscriptionActive && updated.freeBookingsUsed >= updated.freeBookingLimit) {
      toast({
        title: "Llegaste al límite gratuito",
        description: "Se activó el paywall mock para que luego conectes tu API de suscripción.",
      });
      return;
    }

    toast({
      title: "Cita mock gestionada",
      description: updated.subscriptionActive
        ? "La suscripción demo está activa, así que puedes seguir gestionando citas sin límite."
        : `Te quedan ${Math.max(updated.freeBookingLimit - updated.freeBookingsUsed, 0)} citas gratis.`,
    });
  };

  const handleActivateSubscription = () => {
    const updated = activateProfessionalSubscription();
    if (!updated) return;
    toast({
      title: "Plan mensual demo activado",
      description: "El mock ya no bloquea nuevas citas. Luego reemplaza este botón por tu checkout real.",
    });
  };

  const handleResetMock = () => {
    const updated = resetProfessionalProgress();
    if (!updated) return;
    toast({
      title: "Mock reiniciado",
      description: "Volviste al estado freemium inicial con 5 citas gratis.",
    });
  };

  if (loading) {
    return (
      <MobileLayout title="Onboarding profesional" showBack={false}>
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-32 rounded-3xl bg-muted" />
            <div className="h-64 rounded-3xl bg-muted" />
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return (
      <PageTransition>
        <MobileLayout title="Onboarding profesional" showBack={false}>
          <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BriefcaseBusiness className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl font-bold">Activa tu perfil profesional</h1>
            <p className="mt-3 text-muted-foreground">
              Inicia sesión para probar el onboarding mock, el límite de 5 citas gratis y el paywall demo.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => navigate("/auth?mode=signup&redirect=/professional-onboarding")}>Crear cuenta</Button>
              <Button variant="outline" onClick={() => navigate("/auth?redirect=/professional-onboarding")}>Ya tengo cuenta</Button>
              <Button variant="outline" asChild>
                <Link to="/">Volver al inicio</Link>
              </Button>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <MobileLayout title="Onboarding profesional" showBack={false}>
        <div className="container mx-auto max-w-5xl px-4 py-6 md:py-10">
          <div className="max-w-2xl mx-auto space-y-6">
            <section className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
                <Badge variant="secondary" className="mb-4">Usuario normal por defecto</Badge>
                <h1 className="font-display text-3xl font-bold">Conviértete en profesional cuando quieras</h1>
                <p className="mt-3 text-muted-foreground">
                  Gestiona citas, recibe nuevos clientes y activa un plan freemium simple: 5 citas gratis antes del paywall.
                </p>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-muted p-4">
                    <UserRoundCheck className="h-5 w-5 text-primary" />
                    <p className="mt-3 font-medium">Activa tu perfil</p>
                    <p className="text-sm text-muted-foreground">Pasa de usuario normal a profesional en un solo flujo.</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <p className="mt-3 font-medium">5 citas gratis</p>
                    <p className="text-sm text-muted-foreground">Prueba la experiencia freemium antes de monetizar.</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <Crown className="h-5 w-5 text-primary" />
                    <p className="mt-3 font-medium">Paywall claro</p>
                    <p className="text-sm text-muted-foreground">Cuando llegues al límite, muestra el CTA de suscripción.</p>
                  </div>
                </div>
              </div>

              {!professionalState ? (
                <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-5">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Paso 1 · Activa tu cuenta profesional</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Completa los datos básicos, acepta los términos del plan freemium y deja listo el mock para conectar luego tu backend.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="professionalName">Nombre profesional</Label>
                      <Input id="professionalName" value={professionalName} onChange={(e) => setProfessionalName(e.target.value)} placeholder="Ej. Dra. Paula Ortega" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Especialidad</Label>
                      <Input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ej. Psicología" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Ubicación</Label>
                      <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej. Madrid, España" />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Select value={categoryType} onValueChange={(value: "health" | "beauty" | "wellness") => {
                        setCategoryType(value);
                        setSubcategoryId("");
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.type}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subcategoría</Label>
                    <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu subcategoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.subcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción breve</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Cuenta brevemente por qué deberían reservar contigo." className="min-h-28" />
                  </div>

                  <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Paso 2 · Términos mock</p>
                    <p className="mt-2">Recibirás 5 citas gratis. En la cuarta se mostrará una alerta de proximidad al límite y en la quinta aparecerá el paywall.</p>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
                    <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(Boolean(checked))} />
                    <Label htmlFor="terms" className="text-sm leading-6">
                      Acepto el onboarding mock y el modelo freemium de 5 citas gratis antes de la suscripción mensual.
                    </Label>
                  </div>

                  <Button size="lg" className="w-full" onClick={handleActivateProfessional}>
                    Paso 3 · Convertirme en profesional
                  </Button>
                  <Button size="lg" variant="outline" className="w-full" onClick={() => navigate("/")}>
                    Soy cliente / Omitir
                  </Button>
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Badge variant={professionalState.subscriptionActive ? "default" : "secondary"}>
                        {professionalState.subscriptionActive ? "Plan mensual demo" : "Plan freemium activo"}
                      </Badge>
                      <h2 className="mt-3 font-display text-2xl font-bold">Hola, {professionalState.professionalName}</h2>
                    </div>
                    <Button variant="outline" onClick={handleResetMock}>Reiniciar mock</Button>
                  </div>

                  <div className="rounded-2xl bg-muted p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso del plan gratis</span>
                      <span className="font-medium text-foreground">
                        {professionalState.subscriptionActive ? "Sin límite" : `${freeRemaining} citas gratis restantes`}
                      </span>
                    </div>
                    <Progress value={progressValue} className="mt-3" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {professionalState.subscriptionActive
                        ? "La suscripción demo está activa; ya no se bloquean nuevas citas."
                        : `Has gestionado ${freeUsed} de ${freeLimit} citas gratis.`}
                    </p>
                  </div>

                  {isNearLimit && (
                    <div className="rounded-2xl border border-border bg-accent p-4">
                      <p className="font-medium">Atención: estás en la cita 4 de 5</p>
                      <p className="mt-1 text-sm text-muted-foreground">Este es el aviso mock de proximidad al límite para tu futura API.</p>
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <Button size="lg" onClick={handleSimulateBooking} disabled={isLimitReached}>
                      Simular cita gestionada
                    </Button>
                    {!professionalState.subscriptionActive && (
                      <Button size="lg" variant="outline" onClick={handleActivateSubscription}>
                        Activar plan mensual (mock)
                      </Button>
                    )}
                  </div>

                  {isLimitReached && (
                    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Crown className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-display text-xl font-bold">Paywall mock activo</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Llegaste al límite gratuito. Aquí conectarás tu checkout y la validación de suscripción real.
                          </p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Citas ilimitadas</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Seguimiento de clientes</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Monetización lista para API</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 md:sticky md:top-24">
                <h2 className="font-display text-xl font-bold">Dato mock listo para tu API</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Este flujo guarda un objeto en localStorage para que siempre funcione mientras preparas el backend real.
                </p>
                <div className="mt-4 rounded-2xl bg-muted p-4 text-sm">
                  <p><span className="font-medium text-foreground">Key:</span> <code>agendapro_professional_mock_v1</code></p>
                  <p className="mt-2"><span className="font-medium text-foreground">Objeto:</span> <code>professionalStatus</code></p>
                </div>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-muted p-4 text-xs text-muted-foreground">
{JSON.stringify(mockPayload, null, 2)}
                </pre>
              </div>
            </aside>
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
}