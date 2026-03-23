import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/": "AgendaPro",
  "/my-bookings": "Mis citas",
  "/auth": "Cuenta",
};

interface Props {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
}

export default function MobileHeader({ title, showBack, transparent = false }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedTitle = title ?? titles[location.pathname] ?? "AgendaPro";
  const resolvedShowBack = showBack ?? location.pathname !== "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center h-14 px-4 md:hidden safe-area-top",
        transparent
          ? "bg-transparent"
          : "bg-card/95 backdrop-blur-lg border-b border-border"
      )}
    >
      {resolvedShowBack ? (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center h-9 w-9 -ml-1 rounded-full active:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-sm font-bold text-primary-foreground">A</span>
          </div>
        </div>
      )}

      <h1 className={cn(
        "flex-1 font-display font-bold text-foreground truncate",
        resolvedShowBack ? "text-center text-base -ml-9" : "text-lg ml-2"
      )}>
        {resolvedTitle}
      </h1>

      {!resolvedShowBack && (
        <button className="flex items-center justify-center h-9 w-9 -mr-1 rounded-full active:bg-accent transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>
      )}
    </header>
  );
}
