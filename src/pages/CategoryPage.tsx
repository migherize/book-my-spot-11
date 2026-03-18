import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import PageTransition from "@/components/PageTransition";
import { categories, professionals, type CategoryType } from "@/data/mockData";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const categoryStyles: Record<CategoryType, string> = {
  health: "bg-health-light text-health border-health/20",
  beauty: "bg-beauty-light text-beauty border-beauty/20",
  wellness: "bg-wellness-light text-wellness border-wellness/20",
};

export default function CategoryPage() {
  const { categoryId } = useParams();
  const category = categories.find(c => c.id === categoryId);
  const [selectedSub, setSelectedSub] = useState<string>("all");
  const [sortBy, setSortBy] = useState("recommended");

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Categoría no encontrada</h1>
          <Link to="/" className="mt-4 text-primary hover:underline inline-block">Volver al inicio</Link>
        </div>
        <Footer />
      </div>
    );
  }

  let filtered = professionals.filter(p => p.categoryType === category.type);
  if (selectedSub !== "all") {
    filtered = filtered.filter(p => p.subcategoryId === selectedSub);
  }

  if (sortBy === "price") filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`border-b py-8 ${categoryStyles[category.type]}`}
        >
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl font-bold">{category.name}</h1>
            <p className="mt-1 text-sm opacity-80">{category.description}</p>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mb-6 flex flex-wrap items-center gap-3"
          >
            <Badge
              variant={selectedSub === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedSub("all")}
            >
              Todos
            </Badge>
            {category.subcategories.map(sub => (
              <Badge
                key={sub.id}
                variant={selectedSub === sub.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedSub(sub.id)}
              >
                {sub.name} ({sub.professionalCount})
              </Badge>
            ))}

            <div className="ml-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recomendados</SelectItem>
                  <SelectItem value="price">Menor precio</SelectItem>
                  <SelectItem value="rating">Mejor calificados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Results */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <p className="text-lg font-medium text-foreground">Sin resultados</p>
              <p className="mt-1 text-sm text-muted-foreground">Prueba quitando filtros o explorando otra categoría.</p>
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((p, i) => <ProfessionalCard key={p.id} professional={p} index={i} />)}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
