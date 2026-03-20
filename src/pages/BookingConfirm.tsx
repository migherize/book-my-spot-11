import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { fetchProfessionalById, createBooking, sendBookingConfirmation, type Professional } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Clock, MapPin, CheckCircle2, Calendar as CalendarIcon, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const categoryBadgeStyles: Record<string, string> = {
  health: "bg-health-light text-health",
  beauty: "bg-beauty-light text-beauty",
  wellness: "bg-wellness-light text-wellness",
};

export default function BookingConfirm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const professionalId = params.get("professional") || "";
  const dateStr = params.get("date") || "";
  const time = params.get("time") || "";

  const { data: professional } = useQuery({
    queryKey: ["professional", professionalId],
    queryFn: () => fetchProfessionalById(professionalId),
    enabled: !!professionalId,
  });

  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [name, setName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);

  // Update defaults when profile loads
  useState(() => {
    if (profile?.full_name && !name) setName(profile.full_name);
    if (user?.email && !email) setEmail(user.email);
  });

  if (!professional) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Reserva no válida</h1>
          <Link to="/" className="mt-4 text-primary hover:underline inline-block">Volver al inicio</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Inicia sesión", description: "Necesitas una cuenta para reservar una cita.", variant: "destructive" });
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        professional_id: professionalId,
        client_user_id: user.id,
        client_name: name,
        client_email: email,
        client_phone: phone || undefined,
        booking_date: date.toISOString().split("T")[0],
        booking_time: time,
        duration: professional.duration,
        price: professional.price,
        currency: professional.currency,
      });
      setStep("confirmed");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const generateICS = () => {
    const [h, m] = time.split(":").map(Number);
    const start = new Date(date);
    start.setHours(h, m, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + professional.duration);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:Cita con ${professional.name} - ${professional.specialty}`,
      `DESCRIPTION:Reserva confirmada. Duración: ${professional.duration} min. Precio: $${professional.price}`,
      `LOCATION:${professional.location ?? ""}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cita-${professional.name.replace(/\s+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addToGoogleCalendar = () => {
    const [h, m] = time.split(":").map(Number);
    const start = new Date(date);
    start.setHours(h, m, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + professional.duration);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Cita con ${professional.name}`)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(`${professional.specialty} - $${professional.price}`)}&location=${encodeURIComponent(professional.location ?? "")}`;
    window.open(url, "_blank");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl px-4 py-8">
          {step === "form" ? (
            <>
              <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Volver
              </button>
              <h1 className="font-display text-2xl font-bold mb-6">Confirmar reserva</h1>

              <div className="rounded-xl border border-border bg-card p-5 mb-6 space-y-3">
                <div className="flex items-center gap-4">
                  <img src={professional.photo ?? "/placeholder.svg"} alt={professional.name} className="h-14 w-14 rounded-xl object-cover shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-semibold">{professional.name}</h2>
                      <Badge className={categoryBadgeStyles[professional.category_type]}>{professional.specialty}</Badge>
                    </div>
                    {professional.location && <p className="text-sm text-muted-foreground"><MapPin className="inline h-3.5 w-3.5 mr-1" />{professional.location}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm border-t border-border pt-3">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="h-4 w-4" /><span className="capitalize">{formattedDate}</span></span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" /> {time} ({professional.duration} min)</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-display text-xl font-bold">${professional.price}</span>
                </div>
              </div>

              {!user && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Necesitas una cuenta para completar la reserva</p>
                  <Button size="sm" onClick={() => navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}>
                    Iniciar sesión / Registrarse
                  </Button>
                </div>
              )}

              <form onSubmit={handleConfirm} className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h2 className="font-display font-semibold">Tus datos</h2>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" />
                </div>
                <Button type="submit" size="lg" className="w-full mt-2" disabled={submitting || !user}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmar reserva
                </Button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">¡Reserva confirmada!</h1>
                <p className="text-muted-foreground mt-1">Te hemos enviado los detalles a <span className="font-medium text-foreground">{email}</span></p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 text-left space-y-3 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <img src={professional.photo ?? "/placeholder.svg"} alt={professional.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-display font-semibold">{professional.name}</p>
                    <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-border pt-3">
                  <div><span className="text-muted-foreground">Fecha</span><p className="font-medium capitalize">{formattedDate}</p></div>
                  <div><span className="text-muted-foreground">Hora</span><p className="font-medium">{time}</p></div>
                  <div><span className="text-muted-foreground">Duración</span><p className="font-medium">{professional.duration} min</p></div>
                  <div><span className="text-muted-foreground">Precio</span><p className="font-medium">${professional.price}</p></div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Button variant="outline" onClick={generateICS} className="flex-1">
                  <Download className="h-4 w-4 mr-1" /> Descargar .ics
                </Button>
                <Button variant="outline" onClick={addToGoogleCalendar} className="flex-1">
                  <CalendarIcon className="h-4 w-4 mr-1" /> Google Calendar
                </Button>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="link" asChild><Link to="/my-bookings">Ver mis citas</Link></Button>
                <Button variant="link" asChild><Link to="/">Volver al inicio</Link></Button>
              </div>
            </motion.div>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
