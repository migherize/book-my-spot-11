import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, Video, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import MobileLayout from "@/components/MobileLayout";
import PageTransition from "@/components/PageTransition";
import { fetchProfessionalById, fetchAvailableSlots } from "@/lib/api";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const categoryBadgeStyles: Record<string, string> = {
  health: "bg-health-light text-health",
  beauty: "bg-beauty-light text-beauty",
  wellness: "bg-wellness-light text-wellness",
};

export default function ProfessionalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { data: p, isLoading } = useQuery({
    queryKey: ["professional", id],
    queryFn: () => fetchProfessionalById(id!),
    enabled: !!id,
  });

  const { data: slots = [] } = useQuery({
    queryKey: ["slots", id, selectedDate?.toISOString()],
    queryFn: () => fetchAvailableSlots(id!, selectedDate!),
    enabled: !!id && !!selectedDate,
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleBook = () => {
    if (selectedDate && selectedTime && p) {
      navigate(`/booking/confirm?professional=${p.id}&date=${selectedDate.toISOString()}&time=${selectedTime}`);
    }
  };

  if (!isLoading && !p) {
    return (
      <MobileLayout title="Profesional">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Profesional no encontrado</h1>
          <Link to="/" className="mt-4 text-primary hover:underline inline-block">Volver al inicio</Link>
        </div>
      </MobileLayout>
    );
  }

  if (!p) return null;

  return (
    <PageTransition>
      <MobileLayout title={p.name}>
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Desktop back button */}
          <button onClick={() => navigate(-1)} className="mb-6 hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Volver
          </button>

          <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="flex gap-4 md:gap-5 items-start">
                <img src={p.photo ?? "/placeholder.svg"} alt={p.name} className="h-20 w-20 md:h-24 md:w-24 rounded-2xl object-cover shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display text-xl md:text-2xl font-bold">{p.name}</h1>
                    <Badge className={categoryBadgeStyles[p.category_type]}>{p.specialty}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 md:gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-foreground">{p.rating}</span> ({p.review_count})
                    </span>
                    {p.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.location}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {p.duration} min</span>
                    {p.modality.includes("online") && (
                      <span className="flex items-center gap-1"><Video className="h-4 w-4" /> Online</span>
                    )}
                  </div>
                  {p.languages.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" /> {p.languages.join(", ")}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 md:p-5">
                <h2 className="font-display font-semibold mb-2">Sobre mí</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 md:p-5">
                <h2 className="font-display font-semibold mb-2">Precio</h2>
                <p className="text-2xl font-bold text-foreground">${p.price} <span className="text-sm font-normal text-muted-foreground">/ sesión ({p.duration} min)</span></p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4 md:space-y-5 h-fit md:sticky md:top-24">
              <h2 className="font-display text-lg font-bold">Reservar cita</h2>
              <div>
                <h3 className="text-sm font-medium mb-2">Selecciona fecha</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-lg border pointer-events-auto"
                />
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Horarios disponibles</h3>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={cn(
                          "touch-ripple rounded-xl border px-3 py-3 md:py-2 text-sm font-medium transition-all",
                          !slot.available && "opacity-30 cursor-not-allowed line-through",
                          slot.available && selectedTime === slot.time
                            ? "border-primary bg-primary text-primary-foreground"
                            : slot.available
                            ? "border-border hover:border-primary hover:text-primary active:scale-95"
                            : ""
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-display text-lg font-bold">${p.price}</span>
                </div>
                <Button className="w-full active:scale-[0.98] transition-transform" size="lg" disabled={!selectedDate || !selectedTime} onClick={handleBook}>
                  Reservar cita
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
}
