export type CategoryType = "health" | "beauty" | "wellness";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  description: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  categoryType: CategoryType;
  professionalCount: number;
}

export interface Professional {
  id: string;
  name: string;
  photo: string;
  specialty: string;
  subcategoryId: string;
  categoryType: CategoryType;
  description: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  location: string;
  languages: string[];
  modality: ("presencial" | "online")[];
  duration: number; // minutes
  nextAvailable: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export const categories: Category[] = [
  {
    id: "health",
    name: "Salud",
    type: "health",
    icon: "Heart",
    description: "Encuentra profesionales de salud certificados",
    subcategories: [
      { id: "dentistry", name: "Odontología", categoryId: "health", categoryType: "health", professionalCount: 24 },
      { id: "general", name: "Medicina General", categoryId: "health", categoryType: "health", professionalCount: 38 },
      { id: "pediatrics", name: "Pediatría", categoryId: "health", categoryType: "health", professionalCount: 15 },
      { id: "dermatology", name: "Dermatología", categoryId: "health", categoryType: "health", professionalCount: 19 },
    ],
  },
  {
    id: "beauty",
    name: "Belleza",
    type: "beauty",
    icon: "Sparkles",
    description: "Servicios de belleza y cuidado personal",
    subcategories: [
      { id: "barbershop", name: "Barbería", categoryId: "beauty", categoryType: "beauty", professionalCount: 31 },
      { id: "hairdressing", name: "Peluquería", categoryId: "beauty", categoryType: "beauty", professionalCount: 27 },
      { id: "manicure", name: "Manicure", categoryId: "beauty", categoryType: "beauty", professionalCount: 20 },
      { id: "facial", name: "Estética Facial", categoryId: "beauty", categoryType: "beauty", professionalCount: 14 },
    ],
  },
  {
    id: "wellness",
    name: "Bienestar",
    type: "wellness",
    icon: "Leaf",
    description: "Cuida tu mente y cuerpo",
    subcategories: [
      { id: "massage", name: "Masajes", categoryId: "wellness", categoryType: "wellness", professionalCount: 22 },
      { id: "psychology", name: "Psicología", categoryId: "wellness", categoryType: "wellness", professionalCount: 29 },
      { id: "nutrition", name: "Nutrición", categoryId: "wellness", categoryType: "wellness", professionalCount: 16 },
    ],
  },
];

export const professionals: Professional[] = [
  {
    id: "p1",
    name: "Dra. María González",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
    specialty: "Odontología",
    subcategoryId: "dentistry",
    categoryType: "health",
    description: "Especialista en odontología estética y restauradora con más de 12 años de experiencia. Enfoque en tratamientos mínimamente invasivos y atención personalizada.",
    price: 45,
    currency: "USD",
    rating: 4.9,
    reviewCount: 127,
    location: "Madrid, España",
    languages: ["Español", "Inglés"],
    modality: ["presencial"],
    duration: 45,
    nextAvailable: "Hoy",
  },
  {
    id: "p2",
    name: "Dr. Carlos Ruiz",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
    specialty: "Medicina General",
    subcategoryId: "general",
    categoryType: "health",
    description: "Médico general con enfoque integral en salud preventiva. Atención cercana y profesional para toda la familia.",
    price: 35,
    currency: "USD",
    rating: 4.7,
    reviewCount: 89,
    location: "Barcelona, España",
    languages: ["Español", "Catalán"],
    modality: ["presencial", "online"],
    duration: 30,
    nextAvailable: "Mañana",
  },
  {
    id: "p3",
    name: "Ana Martínez",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face",
    specialty: "Peluquería",
    subcategoryId: "hairdressing",
    categoryType: "beauty",
    description: "Estilista creativa especializada en colorimetría y cortes de tendencia. Más de 8 años transformando tu imagen.",
    price: 30,
    currency: "USD",
    rating: 4.8,
    reviewCount: 203,
    location: "Valencia, España",
    languages: ["Español"],
    modality: ["presencial"],
    duration: 60,
    nextAvailable: "Hoy",
  },
  {
    id: "p4",
    name: "Luis Fernández",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    specialty: "Barbería",
    subcategoryId: "barbershop",
    categoryType: "beauty",
    description: "Barbero profesional con estilo clásico y moderno. Experto en degradados, afeitados y cuidado de barba.",
    price: 20,
    currency: "USD",
    rating: 4.9,
    reviewCount: 312,
    location: "Sevilla, España",
    languages: ["Español", "Inglés"],
    modality: ["presencial"],
    duration: 30,
    nextAvailable: "Hoy",
  },
  {
    id: "p5",
    name: "Dra. Sofía López",
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=300&h=300&fit=crop&crop=face",
    specialty: "Psicología",
    subcategoryId: "psychology",
    categoryType: "wellness",
    description: "Psicóloga clínica especializada en terapia cognitivo-conductual. Ayuda con ansiedad, depresión y desarrollo personal.",
    price: 55,
    currency: "USD",
    rating: 4.9,
    reviewCount: 156,
    location: "Madrid, España",
    languages: ["Español", "Inglés", "Francés"],
    modality: ["presencial", "online"],
    duration: 50,
    nextAvailable: "Hoy",
  },
  {
    id: "p6",
    name: "Miguel Torres",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    specialty: "Masajes",
    subcategoryId: "massage",
    categoryType: "wellness",
    description: "Terapeuta corporal certificado en masaje deportivo, descontracturante y relajante. Más de 10 años de experiencia.",
    price: 40,
    currency: "USD",
    rating: 4.8,
    reviewCount: 178,
    location: "Málaga, España",
    languages: ["Español"],
    modality: ["presencial"],
    duration: 60,
    nextAvailable: "Mañana",
  },
  {
    id: "p7",
    name: "Dra. Laura Sánchez",
    photo: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=300&h=300&fit=crop&crop=face",
    specialty: "Dermatología",
    subcategoryId: "dermatology",
    categoryType: "health",
    description: "Dermatóloga con especialización en dermatología clínica y estética. Tratamientos avanzados para el cuidado de la piel.",
    price: 60,
    currency: "USD",
    rating: 4.8,
    reviewCount: 94,
    location: "Madrid, España",
    languages: ["Español", "Inglés"],
    modality: ["presencial", "online"],
    duration: 30,
    nextAvailable: "Hoy",
  },
  {
    id: "p8",
    name: "Carmen Díaz",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    specialty: "Nutrición",
    subcategoryId: "nutrition",
    categoryType: "wellness",
    description: "Nutricionista clínica y deportiva. Planes personalizados para alcanzar tus objetivos de salud y bienestar.",
    price: 40,
    currency: "USD",
    rating: 4.7,
    reviewCount: 112,
    location: "Barcelona, España",
    languages: ["Español", "Inglés"],
    modality: ["presencial", "online"],
    duration: 45,
    nextAvailable: "Mañana",
  },
  {
    id: "p9",
    name: "Isabella Moreno",
    photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face",
    specialty: "Estética Facial",
    subcategoryId: "facial",
    categoryType: "beauty",
    description: "Esteticista certificada en tratamientos faciales avanzados, limpieza profunda y rejuvenecimiento cutáneo.",
    price: 50,
    currency: "USD",
    rating: 4.9,
    reviewCount: 87,
    location: "Madrid, España",
    languages: ["Español"],
    modality: ["presencial"],
    duration: 60,
    nextAvailable: "Hoy",
  },
  {
    id: "p10",
    name: "Lucía Romero",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face",
    specialty: "Manicure",
    subcategoryId: "manicure",
    categoryType: "beauty",
    description: "Experta en nail art, manicure y pedicure. Técnicas de gel, acrílico y diseños personalizados.",
    price: 25,
    currency: "USD",
    rating: 4.8,
    reviewCount: 145,
    location: "Valencia, España",
    languages: ["Español"],
    modality: ["presencial"],
    duration: 45,
    nextAvailable: "Hoy",
  },
  {
    id: "p11",
    name: "Dr. Andrés Vega",
    photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face",
    specialty: "Pediatría",
    subcategoryId: "pediatrics",
    categoryType: "health",
    description: "Pediatra con amplia experiencia en cuidado infantil preventivo y tratamiento de enfermedades pediátricas comunes.",
    price: 40,
    currency: "USD",
    rating: 4.9,
    reviewCount: 201,
    location: "Madrid, España",
    languages: ["Español", "Inglés"],
    modality: ["presencial", "online"],
    duration: 30,
    nextAvailable: "Hoy",
  },
];

export function generateTimeSlots(date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  for (let hour = 9; hour <= 18; hour++) {
    for (const min of [0, 30]) {
      if (hour === 18 && min === 30) continue;
      const slotTime = new Date(date);
      slotTime.setHours(hour, min, 0, 0);
      
      const isPast = isToday && slotTime <= now;
      const isRandomlyBooked = Math.random() < 0.25;
      
      slots.push({
        time: `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
        available: !isPast && !isRandomlyBooked,
      });
    }
  }
  return slots;
}

export function getCategoryColor(type: CategoryType): string {
  switch (type) {
    case "health": return "health";
    case "beauty": return "beauty";
    case "wellness": return "wellness";
  }
}

export function getAllSubcategories(): Subcategory[] {
  return categories.flatMap(c => c.subcategories);
}

export function getProfessionalsBySubcategory(subcategoryId: string): Professional[] {
  return professionals.filter(p => p.subcategoryId === subcategoryId);
}

export function getProfessionalById(id: string): Professional | undefined {
  return professionals.find(p => p.id === id);
}

export function getSubcategoryById(id: string): Subcategory | undefined {
  return getAllSubcategories().find(s => s.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}
