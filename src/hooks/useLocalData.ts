import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDb, enqueueSync } from "@/lib";
import { useNetworkStore } from "@/stores/networkStore";
import type { Category, Transaction, Budget, SavingsGoal } from "@/types";

// ─── Categories ──────────────────────────────────────────

export function useLocalCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const db = await getDb();
      return db.getAllAsync<Category>(
        "SELECT * FROM categories ORDER BY name ASC",
      );
    },
  });
}

export function useUpsertCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (category: Category) => {
      const db = await getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO categories (id, couple_id, name, icon, type, color)
         VALUES (?, ?, ?, ?, ?, ?)`,
        category.id,
        category.couple_id,
        category.name,
        category.icon,
        category.type,
        category.color,
      );

      if (useNetworkStore.getState().isOnline) {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("categories").upsert(category);
      } else {
        await enqueueSync(
          "categories",
          "INSERT",
          category.id,
          category as any,
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = await getDb();
      await db.runAsync("DELETE FROM categories WHERE id = ?", id);

      if (useNetworkStore.getState().isOnline) {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("categories").delete().eq("id", id);
      } else {
        await enqueueSync("categories", "DELETE", id);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// ─── Transactions ────────────────────────────────────────

export function useLocalTransactions(filters?: {
  categoryId?: string;
  type?: string;
  month?: string;
}) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const db = await getDb();
      let sql = "SELECT * FROM transactions WHERE 1=1";
      const params: any[] = [];

      if (filters?.categoryId) {
        sql += " AND category_id = ?";
        params.push(filters.categoryId);
      }
      if (filters?.type) {
        sql += " AND type = ?";
        params.push(filters.type);
      }
      if (filters?.month) {
        sql += " AND strftime('%Y-%m', date) = ?";
        params.push(filters.month);
      }

      sql += " ORDER BY date DESC, created_at DESC LIMIT 100";
      return db.getAllAsync<Transaction>(sql, ...params);
    },
  });
}

export function useUpsertTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tx: Transaction) => {
      const db = await getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO transactions
         (id, couple_id, created_by, amount, type, category_id, description, date, is_split, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        tx.id,
        tx.couple_id,
        tx.created_by,
        tx.amount,
        tx.type,
        tx.category_id,
        tx.description,
        tx.date,
        tx.is_split ? 1 : 0,
        tx.created_at,
        tx.updated_at,
      );

      if (useNetworkStore.getState().isOnline) {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("transactions").upsert(tx);
      } else {
        await enqueueSync("transactions", "INSERT", tx.id, tx as any);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

// ─── Budgets ─────────────────────────────────────────────

export function useLocalBudgets(month?: string) {
  return useQuery({
    queryKey: ["budgets", month],
    queryFn: async () => {
      const db = await getDb();
      if (month) {
        return db.getAllAsync<Budget>(
          "SELECT * FROM budgets WHERE month = ? ORDER BY category_id ASC",
          month,
        );
      }
      return db.getAllAsync<Budget>(
        "SELECT * FROM budgets ORDER BY month DESC, category_id ASC",
      );
    },
  });
}

export function useUpsertBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (budget: Budget) => {
      const db = await getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO budgets (id, couple_id, category_id, month, amount, spent)
         VALUES (?, ?, ?, ?, ?, ?)`,
        budget.id,
        budget.couple_id,
        budget.category_id,
        budget.month,
        budget.amount,
        budget.spent,
      );
      if (useNetworkStore.getState().isOnline) {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("budgets").upsert(budget);
      } else {
        await enqueueSync("budgets", "INSERT", budget.id, budget as any);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = await getDb();
      await db.runAsync("DELETE FROM budgets WHERE id = ?", id);
      if (useNetworkStore.getState().isOnline) {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("budgets").delete().eq("id", id);
      } else {
        await enqueueSync("budgets", "DELETE", id);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

// ─── Savings Goals ───────────────────────────────────────

export function useLocalSavingsGoals() {
  return useQuery({
    queryKey: ["savings_goals"],
    queryFn: async () => {
      const db = await getDb();
      return db.getAllAsync<SavingsGoal>(
        "SELECT * FROM savings_goals ORDER BY created_at DESC",
      );
    },
  });
}

export function useUpsertSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goal: SavingsGoal) => {
      const db = await getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO savings_goals
         (id, couple_id, name, target_amount, current_amount, deadline, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        goal.id,
        goal.couple_id,
        goal.name,
        goal.target_amount,
        goal.current_amount,
        goal.deadline,
        goal.created_at,
      );
      if (useNetworkStore.getState().isOnline) {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("savings_goals").upsert(goal);
      } else {
        await enqueueSync("savings_goals", "INSERT", goal.id, goal as any);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings_goals"] }),
  });
}

export function useDeleteSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = await getDb();
      await db.runAsync("DELETE FROM savings_goals WHERE id = ?", id);
      if (useNetworkStore.getState().isOnline) {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("savings_goals").delete().eq("id", id);
      } else {
        await enqueueSync("savings_goals", "DELETE", id);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings_goals"] }),
  });
}

export function useContributeToGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goal,
      amount,
    }: {
      goal: SavingsGoal;
      amount: number;
    }) => {
      const db = await getDb();
      const newAmount = goal.current_amount + amount;
      await db.runAsync(
        "UPDATE savings_goals SET current_amount = ? WHERE id = ?",
        newAmount,
        goal.id,
      );
      if (useNetworkStore.getState().isOnline) {
        const { supabase } = await import("@/lib/supabase");
        await supabase
          .from("savings_goals")
          .update({ current_amount: newAmount })
          .eq("id", goal.id);
      } else {
        await enqueueSync("savings_goals", "UPDATE", goal.id, {
          current_amount: newAmount,
        } as any);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings_goals"] }),
  });
}
