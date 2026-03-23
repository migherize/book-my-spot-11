import { useParams, Link } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import ProfessionalCard from "@/components/ProfessionalCard";
import PageTransition from "@/components/PageTransition";
import { fetchCategoryWithSubcategories, fetchProfessionalsByCategory, type CategoryType } from "@/lib/api";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const categoryStyles: Record<string, string> = {
  health: "bg-health-light text-health border-health/20",
  beauty: "bg-beauty-light text-beauty border-beauty/20",
  wellness: "bg-wellness-light text-wellness border-wellness/20",
};

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [selectedSub, setSelectedSub] = useState<string>("all");
  const [sortBy, setSortBy] = useState("recommended");

  const { data: catData } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => fetchCategoryWithSubcategories(categoryId!),
    enabled: !!categoryId,
  });

  const category = catData?.category;
  const subcategories = catData?.subcategories ?? [];

  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals", category?.type, selectedSub],
    queryFn: () => fetchProfessionalsByCategory(category!.type as CategoryType, selectedSub),
    enabled: !!category,
  });

  if (!categoryId) return null;

  if (catData && !category) {
    return (
      <MobileLayout title="Categoría">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Categoría no encontrada</h1>
          <Link to="/" className="mt-4 text-primary hover:underline inline-block">Volver al inicio</Link>
        </div>
      </MobileLayout>
    );
  }

  let sorted = [...professionals];
  if (sortBy === "price") sorted.sort((a, b) => a.price - b.price);
  else if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);

  return (
    <PageTransition>
      <MobileLayout title={category?.name ?? "Categoría"}>
        {category && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className={`border-b py-6 md:py-8 ${categoryStyles[category.type] ?? ""}`}>
            <div className="container mx-auto px-4">
              <h1 className="font-display text-2xl md:text-3xl font-bold hidden md:block">{category.name}</h1>
              <p className="mt-1 text-sm opacity-80">{category.description}</p>
            </div>
          </motion.div>
        )}

        <div className="container mx-auto px-4 py-4 md:py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="mb-4 md:mb-6 flex flex-wrap items-center gap-2 md:gap-3">
            <Badge variant={selectedSub === "all" ? "default" : "outline"} className="cursor-pointer touch-ripple" onClick={() => setSelectedSub("all")}>
              Todos
            </Badge>
            {subcategories.map(sub => (
              <Badge key={sub.id} variant={selectedSub === sub.id ? "default" : "outline"} className="cursor-pointer touch-ripple" onClick={() => setSelectedSub(sub.id)}>
                {sub.name} ({sub.professional_count})
              </Badge>
            ))}
            <div className="ml-auto w-full md:w-auto mt-2 md:mt-0">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recomendados</SelectItem>
                  <SelectItem value="price">Menor precio</SelectItem>
                  <SelectItem value="rating">Mejor calificados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {sorted.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <p className="text-lg font-medium text-foreground">Sin resultados</p>
              <p className="mt-1 text-sm text-muted-foreground">Prueba quitando filtros o explorando otra categoría.</p>
            </motion.div>
          ) : (
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              {sorted.map((p, i) => <ProfessionalCard key={p.id} professional={p} index={i} />)}
            </div>
          )}
        </div>
      </MobileLayout>
    </PageTransition>
  );
}
