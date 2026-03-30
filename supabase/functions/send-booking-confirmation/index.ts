import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      client_name,
      client_email,
      professional_name,
      professional_specialty,
      booking_date,
      booking_time,
      duration,
      price,
      currency,
      location,
      type,
    } = body;
    const isCancellation = type === "cancellation";

    if (!client_email || !client_name || !professional_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedDate = new Date(booking_date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const headerBg = isCancellation
      ? "background:linear-gradient(135deg,#dc2626,#ef4444)"
      : "background:linear-gradient(135deg,#6366f1,#8b5cf6)";
    const headerText = isCancellation ? "❌ Cita Cancelada" : "✅ Reserva Confirmada";
    const introText = isCancellation
      ? "Tu cita ha sido cancelada. Aquí tienes los detalles:"
      : "Tu cita ha sido confirmada exitosamente. Aquí tienes los detalles:";

    const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="${headerBg};padding:32px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">${headerText}</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#18181b;font-size:16px;">Hola <strong>${client_name}</strong>,</p>
          <p style="margin:0 0 24px;color:#52525b;font-size:14px;line-height:1.6;">
            Tu cita ha sido confirmada exitosamente. Aquí tienes los detalles:
          </p>
          <table width="100%" cellpadding="12" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin-bottom:24px;">
            <tr>
              <td style="color:#71717a;font-size:13px;border-bottom:1px solid #e4e4e7;">Profesional</td>
              <td style="color:#18181b;font-size:14px;font-weight:600;border-bottom:1px solid #e4e4e7;text-align:right;">${professional_name}</td>
            </tr>
            <tr>
              <td style="color:#71717a;font-size:13px;border-bottom:1px solid #e4e4e7;">Especialidad</td>
              <td style="color:#18181b;font-size:14px;border-bottom:1px solid #e4e4e7;text-align:right;">${professional_specialty}</td>
            </tr>
            <tr>
              <td style="color:#71717a;font-size:13px;border-bottom:1px solid #e4e4e7;">Fecha</td>
              <td style="color:#18181b;font-size:14px;border-bottom:1px solid #e4e4e7;text-align:right;text-transform:capitalize;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="color:#71717a;font-size:13px;border-bottom:1px solid #e4e4e7;">Hora</td>
              <td style="color:#18181b;font-size:14px;border-bottom:1px solid #e4e4e7;text-align:right;">${booking_time}</td>
            </tr>
            <tr>
              <td style="color:#71717a;font-size:13px;border-bottom:1px solid #e4e4e7;">Duración</td>
              <td style="color:#18181b;font-size:14px;border-bottom:1px solid #e4e4e7;text-align:right;">${duration} min</td>
            </tr>
            ${location ? `<tr>
              <td style="color:#71717a;font-size:13px;border-bottom:1px solid #e4e4e7;">Ubicación</td>
              <td style="color:#18181b;font-size:14px;border-bottom:1px solid #e4e4e7;text-align:right;">${location}</td>
            </tr>` : ""}
            <tr>
              <td style="color:#71717a;font-size:13px;">Precio</td>
              <td style="color:#18181b;font-size:18px;font-weight:700;text-align:right;">$${price} ${currency}</td>
            </tr>
          </table>
          <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">
            Si necesitas cancelar o modificar tu cita, accede a "Mis Citas" en la plataforma.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px;background:#fafafa;text-align:center;border-top:1px solid #e4e4e7;">
          <p style="margin:0;color:#a1a1aa;font-size:11px;">Este es un email automático. Por favor no respondas a este mensaje.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Use Supabase's built-in email via the Auth admin API isn't available for transactional,
    // so we log the email for now and return success. 
    // In production, integrate a transactional email provider.
    console.log(`📧 Booking confirmation email prepared for: ${client_email}`);
    console.log(`   Professional: ${professional_name} | Date: ${formattedDate} | Time: ${booking_time}`);

    // Try to send via Resend if API key is available, otherwise just log
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (RESEND_API_KEY) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "BookMySpot <reservas@resend.dev>",
          to: [client_email],
          subject: `Reserva confirmada con ${professional_name}`,
          html: htmlBody,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("Resend error:", errText);
        return new Response(
          JSON.stringify({ success: true, email_sent: false, reason: "Email service error" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, email_sent: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No email provider configured — return success with notification logged
    return new Response(
      JSON.stringify({
        success: true,
        email_sent: false,
        reason: "No email provider configured. Confirmation logged on server.",
        email_preview: { to: client_email, subject: `Reserva confirmada con ${professional_name}` },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-booking-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
