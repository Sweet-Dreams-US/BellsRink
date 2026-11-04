// Saved from the old BellsRink Supabase project. Only the admin-dashboard-prototype
// branch calls this; it is not deployed on FreeWebsites. Before reviving it, make the
// client below use db: { schema: "bells" } and deploy it under a Bells-specific name.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { id } = await req.json();
    if (!id) return json({ error: "Missing notification id" }, 400);

    // Load the notification (RLS requires an authenticated admin)
    const { data: note, error: noteErr } = await supabase
      .from("admin_notifications")
      .select("*")
      .eq("id", id)
      .single();
    if (noteErr || !note) return json({ error: "Notification not found or not authorized" }, 404);

    // Gather recipient emails
    const { data: customers } = await supabase
      .from("admin_customers")
      .select("email")
      .not("email", "is", null);
    const emails = (customers ?? []).map((c: { email: string }) => c.email).filter(Boolean);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_LIVE = Deno.env.get("RESEND_LIVE") === "true";
    const FROM = Deno.env.get("RESEND_FROM") ?? "Bell's Rink <onboarding@resend.dev>";

    let sent = emails.length;
    let status = "sent";
    let errorMsg: string | null = null;

    // Only send for real when a key is present AND live mode is explicitly on.
    // (Prevents bouncing emails to the prototype's fake @example.com addresses.)
    if (RESEND_API_KEY && RESEND_LIVE && emails.length > 0) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM,
            to: FROM, // single send, recipients in bcc to protect privacy
            bcc: emails,
            subject: note.subject,
            html: `<div style="font-family:sans-serif;font-size:16px;line-height:1.6;color:#1c1c2e">${
              String(note.body).replace(/\n/g, "<br>")
            }<hr style="border:none;border-top:1px solid #eee;margin:24px 0"><p style="color:#888;font-size:13px">Bell's Skating Rink · Fort Wayne, IN</p></div>`,
          }),
        });
        if (!res.ok) {
          status = "failed";
          errorMsg = `Resend error ${res.status}: ${await res.text()}`;
          sent = 0;
        }
      } catch (e) {
        status = "failed";
        errorMsg = String(e);
        sent = 0;
      }
    } else {
      // Simulated send — flows through the whole UI without emailing fake addresses.
      errorMsg = RESEND_API_KEY ? null : "Simulated (no RESEND_API_KEY set)";
    }

    await supabase
      .from("admin_notifications")
      .update({
        status,
        recipient_count: sent,
        sent_at: new Date().toISOString(),
        error: errorMsg,
      })
      .eq("id", id);

    return json({ sent, status, simulated: !(RESEND_API_KEY && RESEND_LIVE) });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
