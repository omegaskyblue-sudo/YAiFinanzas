import { supabase } from "./supabase";
import { getDb } from "./database";
import type { Category, Transaction } from "@/types";
import { SUPABASE_URL } from "./constants";

async function notifyPartnerOnNewTransaction(tx: Transaction) {
  try {
    await fetch(
      `${SUPABASE_URL}/functions/v1/notify-partner`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          couple_id: tx.couple_id,
          transaction_id: tx.id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          created_by: tx.created_by,
        }),
      },
    );
  } catch (e) {
    console.warn("Failed to notify partner:", e);
  }
}

type SyncTable = "categories" | "transactions" | "budgets" | "savings_goals";

export async function enqueueSync(
  table: SyncTable,
  operation: "INSERT" | "UPDATE" | "DELETE",
  recordId: string,
  data?: Record<string, any>,
) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO sync_queue (table_name, operation, record_id, data) VALUES (?, ?, ?, ?)`,
    table,
    operation,
    recordId,
    data ? JSON.stringify(data) : null,
  );
}

export async function processSyncQueue() {
  const db = await getDb();
  const queue = await db.getAllAsync<{
    id: number;
    table_name: string;
    operation: string;
    record_id: string;
    data: string | null;
  }>(
    "SELECT * FROM sync_queue ORDER BY id ASC LIMIT 50",
  );

  for (const item of queue) {
    const table = item.table_name as SyncTable;
    const data = item.data ? JSON.parse(item.data) : {};

    try {
      if (item.operation === "DELETE") {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("id", item.record_id);
        if (error) throw error;
      } else if (item.operation === "INSERT") {
        const { error } = await supabase.from(table).insert(data);
        if (error) throw error;

        if (table === "transactions") {
          notifyPartnerOnNewTransaction(data as unknown as Transaction);
        }
      } else if (item.operation === "UPDATE") {
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq("id", item.record_id);
        if (error) throw error;
      }

      await db.runAsync("DELETE FROM sync_queue WHERE id = ?", item.id);
    } catch (e) {
      console.warn(`Sync failed for ${table} ${item.operation}:`, e);
      break;
    }
  }
}

export async function pullRemoteData(coupleId: string) {
  const db = await getDb();

  const tables: SyncTable[] = [
    "categories",
    "transactions",
    "budgets",
    "savings_goals",
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .or(`couple_id.eq.${coupleId},couple_id.is.null`);

    if (error) {
      console.warn(`Pull failed for ${table}:`, error.message);
      continue;
    }
    if (!data || data.length === 0) continue;

    const placeholders = data.map(() => "?").join(",");
    const ids = data.map((r: any) => r.id);

    await db.runAsync(
      `DELETE FROM ${table} WHERE id IN (${placeholders})`,
      ...ids,
    );

    for (const row of data) {
      const keys = Object.keys(row);
      const values = keys.map((k) => {
        if (typeof row[k] === "boolean") return row[k] ? 1 : 0;
        return row[k];
      });
      const cols = keys.join(",");
      const vals = keys.map(() => "?").join(",");

      await db.runAsync(
        `INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${vals})`,
        ...values,
      );
    }
  }
}
