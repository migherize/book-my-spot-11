import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <Button variant="ghost" size="sm">Iniciar sesión</Button>
          <Button size="sm">Soy profesional</Button>
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
            <Button variant="ghost" size="sm" className="justify-start">Iniciar sesión</Button>
            <Button size="sm">Soy profesional</Button>
          </div>
        </div>
      )}
    </nav>
  );
}
