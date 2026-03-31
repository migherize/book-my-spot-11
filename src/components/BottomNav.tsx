import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const tabs = [
  { icon: Home, label: "Inicio", path: "/" },
  { icon: Search, label: "Buscar", path: "/category/health" },
  { icon: CalendarDays, label: "Mis citas", path: "/my-bookings", requiresAuth: true },
  { icon: User, label: "Perfil", path: "/auth", requiresAuth: false },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTap = (tab: typeof tabs[0]) => {
    if (tab.label === "Perfil" && user) {
      navigate("/professional-onboarding");
    } else {
      navigate(tab.path);
    }
  };

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(tab.path) ||
      (tab.label === "Buscar" && location.pathname.startsWith("/category")) ||
      (tab.label === "Buscar" && location.pathname.startsWith("/professional"));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <button
              key={tab.label}
              onClick={() => handleTap(tab)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors active:scale-95",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
