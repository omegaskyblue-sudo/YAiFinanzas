import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getDb } from "@/lib/database";
import { useAuthStore } from "@/stores/authStore";

type RealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, any>;
  old: Record<string, any>;
};

function tableQueryKey(table: string) {
  if (table === "savings_goals") return ["savings_goals"];
  return [table];
}

async function applyChangeToLocal(
  table: string,
  payload: RealtimePayload,
) {
  const db = await getDb();
  const { eventType, new: newRow, old: oldRow } = payload;

  try {
    if (eventType === "DELETE") {
      await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, oldRow.id);
      return;
    }

    if (eventType === "INSERT" || eventType === "UPDATE") {
      const keys = Object.keys(newRow);
      const values = keys.map((k) => {
        if (typeof newRow[k] === "boolean") return newRow[k] ? 1 : 0;
        return newRow[k];
      });
      const cols = keys.join(",");
      const placeholders = keys.map(() => "?").join(",");

      await db.runAsync(
        `INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${placeholders})`,
        ...values,
      );
    }
  } catch (e) {
    console.warn(`Realtime sync: failed to apply change to ${table}:`, e);
  }
}

export function useRealtimeSync() {
  const coupleId = useAuthStore((s) => s.coupleId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    const tables = [
      "transactions",
      "categories",
      "budgets",
      "savings_goals",
    ];

    const channels = tables.map((table) => {
      const channel = supabase
        .channel(`public:${table}:couple_id=eq.${coupleId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
            filter: `couple_id=eq.${coupleId}`,
          },
          async (payload: any) => {
            await applyChangeToLocal(table, payload);
            queryClient.invalidateQueries({
              queryKey: tableQueryKey(table),
            });
          },
        )
        .subscribe();

      return channel;
    });

    // Also listen for system categories (couple_id is null)
    const categoriesChannel = supabase
      .channel("public:categories:couple_id=is.null")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: "couple_id=is.null",
        },
        async (payload: any) => {
          await applyChangeToLocal("categories", payload);
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
      )
      .subscribe();

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
      supabase.removeChannel(categoriesChannel);
    };
  }, [coupleId, queryClient]);
}
