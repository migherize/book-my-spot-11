import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, Video, Globe, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { getProfessionalById, generateTimeSlots, type TimeSlot } from "@/data/mockData";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categoryBadgeStyles = {
  health: "bg-health-light text-health",
  beauty: "bg-beauty-light text-beauty",
  wellness: "bg-wellness-light text-wellness",
};

export default function ProfessionalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const professional = getProfessionalById(id || "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>(generateTimeSlots(new Date()));

  if (!professional) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Profesional no encontrado</h1>
          <Link to="/" className="mt-4 text-primary hover:underline inline-block">Volver al inicio</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const p = professional;

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (date) setSlots(generateTimeSlots(date));
  };

  const handleBook = () => {
    if (selectedDate && selectedTime) {
      navigate(`/booking/confirm?professional=${p.id}&date=${selectedDate.toISOString()}&time=${selectedTime}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-5 items-start">
              <img src={p.photo} alt={p.name} className="h-24 w-24 rounded-2xl object-cover shrink-0" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl font-bold">{p.name}</h1>
                  <Badge className={categoryBadgeStyles[p.categoryType]}>{p.specialty}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">{p.rating}</span> ({p.reviewCount} reseñas)
                  </span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {p.duration} min</span>
                  {p.modality.includes("online") && (
                    <span className="flex items-center gap-1"><Video className="h-4 w-4" /> Online disponible</span>
                  )}
                </div>
                {p.languages.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" /> {p.languages.join(", ")}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display font-semibold mb-2">Sobre mí</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display font-semibold mb-2">Precio</h2>
              <p className="text-2xl font-bold text-foreground">${p.price} <span className="text-sm font-normal text-muted-foreground">/ sesión ({p.duration} min)</span></p>
            </div>
          </div>

          {/* Booking Panel */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-5 h-fit sticky top-24">
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
                        "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                        !slot.available && "opacity-30 cursor-not-allowed line-through",
                        slot.available && selectedTime === slot.time
                          ? "border-primary bg-primary text-primary-foreground"
                          : slot.available
                          ? "border-border hover:border-primary hover:text-primary"
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
              <Button
                className="w-full"
                size="lg"
                disabled={!selectedDate || !selectedTime}
                onClick={handleBook}
              >
                Reservar cita
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
