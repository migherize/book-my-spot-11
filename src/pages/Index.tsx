import { useNavigate } from "react-router-dom";
import { Search, Heart, Sparkles, Leaf, ArrowRight, CalendarCheck, UserSearch, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileLayout from "@/components/MobileLayout";
import ProfessionalCard from "@/components/ProfessionalCard";
import PageTransition from "@/components/PageTransition";
import { fetchCategories, fetchPopularProfessionals, type Category, type Professional } from "@/lib/api";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const categoryIcons: Record<string, typeof Heart> = { health: Heart, beauty: Sparkles, wellness: Leaf };
const categoryColors: Record<string, string> = {
  health: "bg-health-light text-health hover:bg-health hover:text-primary-foreground",
  beauty: "bg-beauty-light text-beauty hover:bg-beauty hover:text-primary-foreground",
  wellness: "bg-wellness-light text-wellness hover:bg-wellness hover:text-primary-foreground",
};

const steps = [
  { icon: UserSearch, title: "Busca", description: "Explora profesionales por categoría, especialidad o ubicación." },
  { icon: CalendarCheck, title: "Elige", description: "Selecciona fecha, hora y el profesional ideal para ti." },
  { icon: CheckCircle, title: "Reserva", description: "Confirma tu cita en segundos. ¡Así de fácil!" },
];

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Index() {
  const navigate = useNavigate();
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: popular = [] } = useQuery({ queryKey: ["popular-professionals"], queryFn: () => fetchPopularProfessionals(4) });

  return (
    <PageTransition>
      <MobileLayout showBack={false} transparentHeader>
        {/* Hero */}
        <section className="relative overflow-hidden py-12 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-health-light via-background to-wellness-light opacity-60" />
          <motion.div className="container relative mx-auto px-4 text-center" variants={stagger} initial="initial" animate="animate">
            <motion.h1 variants={fadeUp} className="font-display text-3xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Agenda tu cita<br /><span className="text-primary">en minutos</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto mt-3 md:mt-4 max-w-lg text-base md:text-lg text-muted-foreground">
              Encuentra profesionales verificados de salud, belleza y bienestar.
            </motion.p>
            <motion.div variants={fadeUp} className="mx-auto mt-6 md:mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lg">
              <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
              <Input placeholder="¿Qué servicio necesitas?" className="border-0 bg-transparent shadow-none focus-visible:ring-0" onKeyDown={(e) => { if (e.key === "Enter") navigate("/category/health"); }} />
              <Button onClick={() => navigate("/category/health")}>Buscar</Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Categories */}
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4">
            <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="font-display text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">
              Explora por categoría
            </motion.h2>
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
              {categories.map((cat, i) => {
                const Icon = categoryIcons[cat.type] ?? Heart;
                return (
                  <motion.button key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(`/category/${cat.id}`)} className={`touch-ripple group flex items-center md:flex-col gap-4 md:gap-3 rounded-xl border border-border p-5 md:p-8 transition-colors ${categoryColors[cat.type] ?? ""}`}>
                    <Icon className="h-8 w-8 md:h-10 md:w-10 shrink-0" />
                    <div className="text-left md:text-center">
                      <span className="font-display text-lg md:text-xl font-bold block">{cat.name}</span>
                      <span className="text-sm opacity-80">{cat.description}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popular */}
        <section className="py-10 md:py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <motion.h2 initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="font-display text-xl md:text-2xl font-bold">
                Profesionales destacados
              </motion.h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/category/health")} className="text-primary">
                Ver todos <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              {popular.map((p, i) => <ProfessionalCard key={p.id} professional={p} index={i} />)}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-xl md:text-2xl font-bold mb-8 md:mb-12">
              ¿Cómo funciona?
            </motion.h2>
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
              {steps.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.15 }} className="flex flex-row md:flex-col items-center gap-4">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }} className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                    <step.icon className="h-7 w-7 md:h-8 md:w-8" />
                  </motion.div>
                  <div className="text-left md:text-center">
                    <h3 className="font-display text-lg md:text-xl font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </MobileLayout>
    </PageTransition>
  );
}
