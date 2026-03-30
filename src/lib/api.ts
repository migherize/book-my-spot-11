import { supabase } from "@/integrations/supabase/client";

export type CategoryType = "health" | "beauty" | "wellness";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  description: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  category_type: CategoryType;
  professional_count: number;
}

export interface Professional {
  id: string;
  name: string;
  photo: string | null;
  specialty: string;
  subcategory_id: string;
  category_type: CategoryType;
  description: string | null;
  price: number;
  currency: string;
  rating: number;
  review_count: number;
  location: string | null;
  languages: string[];
  modality: string[];
  duration: number;
  next_available: string | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// ===== Categories =====
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchCategoryWithSubcategories(categoryId: string) {
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId);

  return {
    category: category as Category | null,
    subcategories: (subcategories ?? []) as Subcategory[],
  };
}

// ===== Professionals =====
export async function fetchProfessionalsByCategory(categoryType: CategoryType, subcategoryId?: string) {
  let query = supabase.from("professionals").select("*").eq("category_type", categoryType);
  if (subcategoryId && subcategoryId !== "all") {
    query = query.eq("subcategory_id", subcategoryId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Professional[];
}

export async function fetchProfessionalById(id: string): Promise<Professional | null> {
  const { data, error } = await supabase.from("professionals").select("*").eq("id", id).single();
  if (error) return null;
  return data as Professional;
}

export async function fetchPopularProfessionals(limit = 4): Promise<Professional[]> {
  const { data } = await supabase
    .from("professionals")
    .select("*")
    .order("review_count", { ascending: false })
    .limit(limit);
  return (data ?? []) as Professional[];
}

// ===== Time slots =====
export async function fetchAvailableSlots(professionalId: string, date: Date): Promise<TimeSlot[]> {
  const dateStr = date.toISOString().split("T")[0];
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  // Get existing bookings for this professional on this date
  const { data: bookings } = await supabase
    .from("bookings")
    .select("booking_time")
    .eq("professional_id", professionalId)
    .eq("booking_date", dateStr)
    .neq("status", "cancelled");

  const bookedTimes = new Set((bookings ?? []).map((b: { booking_time: string }) => b.booking_time.slice(0, 5)));

  const slots: TimeSlot[] = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (const min of [0, 30]) {
      if (hour === 18 && min === 30) continue;
      const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
      const slotTime = new Date(date);
      slotTime.setHours(hour, min, 0, 0);
      const isPast = isToday && slotTime <= now;
      const isBooked = bookedTimes.has(time);
      slots.push({ time, available: !isPast && !isBooked });
    }
  }
  return slots;
}

// ===== Bookings =====
export async function createBooking(params: {
  professional_id: string;
  client_user_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  price: number;
  currency: string;
}) {
  const { data, error } = await supabase.from("bookings").insert(params).select().single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("Este horario ya está reservado. Por favor elige otro.");
    }
    throw error;
  }
  return data;
}

export async function sendBookingConfirmation(params: {
  client_name: string;
  client_email: string;
  professional_name: string;
  professional_specialty: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  price: number;
  currency: string;
  location?: string;
}) {
  try {
    const { data, error } = await supabase.functions.invoke("send-booking-confirmation", {
      body: params,
    });
    if (error) console.error("Email notification error:", error);
    return data;
  } catch (err) {
    console.error("Failed to send booking confirmation:", err);
  }
}

export async function cancelBooking(bookingId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" as any })
    .eq("id", bookingId)
    .select("*, professionals(name, specialty, location)")
    .single();
  if (error) throw error;
  return data;
}

export async function sendBookingCancellation(params: {
  client_name: string;
  client_email: string;
  professional_name: string;
  professional_specialty: string;
  booking_date: string;
  booking_time: string;
}) {
  try {
    const { data, error } = await supabase.functions.invoke("send-booking-confirmation", {
      body: { ...params, type: "cancellation" },
    });
    if (error) console.error("Cancellation email error:", error);
    return data;
  } catch (err) {
    console.error("Failed to send cancellation email:", err);
  }
}

// ===== Reviews =====
export interface Review {
  id: string;
  professional_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export async function fetchReviews(professionalId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function createReview(params: {
  professional_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment?: string;
}) {
  const { data, error } = await supabase.from("reviews").insert(params).select().single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya has dejado una reseña para este profesional.");
    }
    throw error;
  }
  return data;
}

export async function deleteReview(reviewId: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw error;
}

export async function fetchUserBookings(userId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, professionals(name, photo, specialty, location)")
    .eq("client_user_id", userId)
    .order("booking_date", { ascending: false });
  if (error) throw error;
  return data;
}
  const { data, error } = await supabase
    .from("bookings")
    .select("*, professionals(name, photo, specialty, location)")
    .eq("client_user_id", userId)
    .order("booking_date", { ascending: false });
  if (error) throw error;
  return data;
}
