import { Link } from "react-router-dom";
import { Star, MapPin, Clock, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { Professional } from "@/lib/api";

interface Props {
  professional: Professional;
  index?: number;
}

const categoryStyles: Record<string, string> = {
  health: "bg-health-light text-health",
  beauty: "bg-beauty-light text-beauty",
  wellness: "bg-wellness-light text-wellness",
};

export default function ProfessionalCard({ professional, index = 0 }: Props) {
  const p = professional;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/professional/${p.id}`}
        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5"
      >
        <div className="flex gap-4 p-5">
          <img
            src={p.photo ?? "/placeholder.svg"}
            alt={p.name}
            className="h-20 w-20 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.specialty}</p>
              </div>
              <Badge variant="secondary" className={categoryStyles[p.category_type] ?? ""}>
                {p.specialty}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{p.rating}</span>
                <span>({p.review_count})</span>
              </span>
              {p.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {p.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {p.duration} min
            </span>
            {p.modality.includes("online") && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Video className="h-3.5 w-3.5" /> Online
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{p.next_available ?? ""}</span>
            <span className="font-display font-bold text-foreground">${p.price}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
