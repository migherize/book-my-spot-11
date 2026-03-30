import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserBookings, cancelBooking, sendBookingCancellation } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import PageTransition from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarDays, Clock, X } from "lucide-react";
import { toast } from "sonner";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmed: { label: "Confirmada", variant: "default" },
  pending: { label: "Pendiente", variant: "secondary" },
  cancelled: { label: "Cancelada", variant: "destructive" },
  completed: { label: "Completada", variant: "outline" },
};

export default function MyBookings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState<any>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: () => fetchUserBookings(user!.id),
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: async (booking: any) => {
      const updated = await cancelBooking(booking.id);
      await sendBookingCancellation({
        client_name: booking.client_name,
        client_email: booking.client_email,
        professional_name: booking.professionals?.name ?? "Profesional",
        professional_specialty: booking.professionals?.specialty ?? "",
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
      });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success("Cita cancelada correctamente");
      setCancelTarget(null);
    },
    onError: () => {
      toast.error("No se pudo cancelar la cita");
    },
  });

  if (!loading && !user) {
    return (
      <MobileLayout title="Mis citas" showBack={false}>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Inicia sesión para ver tus citas</h1>
          <Button onClick={() => navigate("/auth")}>Iniciar sesión</Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <PageTransition>
      <MobileLayout title="Mis citas" showBack={false}>
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-3xl">
          <h1 className="font-display text-2xl font-bold mb-4 md:mb-6 hidden md:block">Mis citas</h1>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-24 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">Aún no tienes citas reservadas</p>
              <Button asChild><Link to="/">Explorar profesionales</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b: any) => {
                const status = statusLabels[b.status] ?? statusLabels.confirmed;
                const date = new Date(b.booking_date + "T00:00:00");
                const canCancel = b.status === "confirmed" || b.status === "pending";
                return (
                  <div key={b.id} className="touch-ripple rounded-2xl border border-border bg-card p-4 md:p-5 active:scale-[0.99] transition-transform">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {b.professionals?.photo && (
                          <img src={b.professionals.photo} alt={b.professionals.name} className="h-12 w-12 rounded-xl object-cover" />
                        )}
                        <div>
                          <p className="font-display font-semibold">{b.professionals?.name ?? "Profesional"}</p>
                          <p className="text-sm text-muted-foreground">{b.professionals?.specialty}</p>
                        </div>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 md:gap-4 text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {b.booking_time?.slice(0, 5)} ({b.duration} min)
                      </span>
                      <span className="font-medium text-foreground ml-auto">${b.price}</span>
                    </div>
                    {canCancel && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full md:w-auto"
                          onClick={() => setCancelTarget(b)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar cita
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cancelar esta cita?</AlertDialogTitle>
              <AlertDialogDescription>
                {cancelTarget && (
                  <>
                    Tu cita con <strong>{cancelTarget.professionals?.name}</strong> el{" "}
                    {new Date(cancelTarget.booking_date + "T00:00:00").toLocaleDateString("es-ES", {
                      weekday: "long", day: "numeric", month: "long",
                    })}{" "}
                    a las {cancelTarget.booking_time?.slice(0, 5)} será cancelada. Esta acción no se puede deshacer.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Volver</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget)}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Cancelando..." : "Sí, cancelar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MobileLayout>
    </PageTransition>
  );
}
