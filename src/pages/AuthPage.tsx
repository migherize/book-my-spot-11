import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MobileLayout from "@/components/MobileLayout";
import PageTransition from "@/components/PageTransition";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const redirect = searchParams.get("redirect");
  const nextPath = redirect || "/professional-onboarding";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        if (data.session) {
          toast({ title: "¡Cuenta creada!", description: "Ahora puedes activar tu perfil profesional si lo deseas." });
          navigate(nextPath);
        } else {
          toast({ title: "¡Cuenta creada!", description: "Revisa tu email para verificar tu cuenta y luego iniciar sesión." });
          setMode("login");
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        navigate(nextPath);
      }
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <MobileLayout title={mode === "login" ? "Iniciar sesión" : "Crear cuenta"} hideNavbar hideFooter>
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4">
          <div className="w-full max-w-md space-y-6">
            <Link to="/" className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Volver al inicio
            </Link>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
                <span className="font-display text-xl font-bold text-primary-foreground">A</span>
              </div>
              <h1 className="font-display text-2xl font-bold hidden md:block">
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "login" ? "Accede a tu cuenta de AgendaPro" : "Regístrate para reservar citas"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre" className="h-12 md:h-10 text-base" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="h-12 md:h-10 text-base" inputMode="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="h-12 md:h-10 text-base" />
              </div>
              <Button type="submit" className="w-full h-12 active:scale-[0.98] transition-transform" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary font-medium hover:underline">
                {mode === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
}
