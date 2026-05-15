import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2";

interface NotificationPayload {
  couple_id: string;
  transaction_id: string;
  type: "income" | "expense";
  amount: number;
  description?: string;
  created_by: string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { couple_id, transaction_id, type, amount, description, created_by } = payload;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: partners } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("couple_id", couple_id)
      .neq("id", created_by);

    if (!partners || partners.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const partnerIds = partners.map((p) => p.id);
    const partnerNames = Object.fromEntries(
      partners.map((p) => [p.id, p.name]),
    );

    const { data: tokens } = await supabase
      .from("push_tokens")
      .select("user_id, token")
      .in("user_id", partnerIds);

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const typeLabel = type === "income" ? "Ingreso" : "Gasto";
    const formattedAmount = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
    const desc = description ? `: ${description}` : "";
    const title = `Nuevo ${typeLabel}`;
    const body = `${formattedAmount}${desc}`;

    const messages = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title,
      body,
      data: { type: "transaction", id: transaction_id },
    }));

    const expoResponse = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      },
    );

    const result = await expoResponse.json();

    return new Response(JSON.stringify({ sent: messages.length, result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
