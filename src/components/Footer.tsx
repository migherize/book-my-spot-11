import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-sm font-bold text-primary-foreground">A</span>
              </div>
              <span className="font-display text-lg font-bold">AgendaPro</span>
            </div>
            <p className="text-sm text-muted-foreground">La plataforma más fácil para agendar citas con profesionales verificados.</p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Categorías</h4>
            <div className="flex flex-col gap-2">
              <Link to="/category/health" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Salud</Link>
              <Link to="/category/beauty" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Belleza</Link>
              <Link to="/category/wellness" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Bienestar</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Empresa</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Sobre nosotros</span>
              <span className="text-sm text-muted-foreground">Contacto</span>
              <span className="text-sm text-muted-foreground">Blog</span>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Términos y condiciones</span>
              <span className="text-sm text-muted-foreground">Política de privacidad</span>
              <span className="text-sm text-muted-foreground">Cookies</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © 2026 AgendaPro. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
