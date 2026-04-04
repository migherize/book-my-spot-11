import { Link, useNavigate } from "react-router-dom";
import { Menu, X, CalendarDays, LogOut, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, professionalState, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-lg font-bold text-primary-foreground">A</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">AgendaPro</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/category/health" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Salud</Link>
          <Link to="/category/beauty" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Belleza</Link>
          <Link to="/category/wellness" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Bienestar</Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/professional-onboarding")}>
                {professionalState ? "Panel pro" : "Ser profesional"}
              </Button>
              {professionalState && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/payment-settings")}>
                  <CreditCard className="mr-1 h-4 w-4" /> Pagos
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate("/my-bookings")}>
                <CalendarDays className="mr-1 h-4 w-4" /> Mis citas
              </Button>
              <span className="text-sm text-muted-foreground">{profile?.full_name ?? user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Iniciar sesión</Button>
              <Button size="sm" onClick={() => navigate("/auth?mode=signup&redirect=/professional-onboarding")}>Soy profesional</Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/category/health" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Salud</Link>
            <Link to="/category/beauty" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Belleza</Link>
            <Link to="/category/wellness" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Bienestar</Link>
            <hr className="border-border" />
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/professional-onboarding"); setMobileOpen(false); }}>
                  {professionalState ? "Panel pro" : "Ser profesional"}
                </Button>
                {professionalState && (
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/payment-settings"); setMobileOpen(false); }}>
                    <CreditCard className="mr-1 h-4 w-4" /> Config. pagos
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/my-bookings"); setMobileOpen(false); }}>
                  <CalendarDays className="mr-1 h-4 w-4" /> Mis citas
                </Button>
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                  <LogOut className="mr-1 h-4 w-4" /> Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Iniciar sesión</Button>
                <Button size="sm" onClick={() => { navigate("/auth?mode=signup&redirect=/professional-onboarding"); setMobileOpen(false); }}>Soy profesional</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
