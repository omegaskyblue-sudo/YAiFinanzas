import { useLocalSearchParams, router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useUpsertTransaction } from "@/hooks/useLocalData";
import TransactionForm from "@/components/TransactionForm";
import { generateId } from "@/lib/utils";

export default function NewTransactionScreen() {
  const { type: preselectedType } = useLocalSearchParams<{ type?: string }>();
  const user = useAuthStore((s) => s.user);
  const coupleId = useAuthStore((s) => s.coupleId);
  const { mutateAsync, isPending } = useUpsertTransaction();

  async function handleSubmit(data: {
    amount: string;
    type: string;
    category_id: string | null;
    description: string;
    date: string;
  }) {
    const now = new Date().toISOString();
    await mutateAsync({
      id: generateId(),
      couple_id: coupleId!,
      created_by: user!.id,
      amount: parseFloat(data.amount),
      type: data.type as "income" | "expense",
      category_id: data.category_id,
      description: data.description || null,
      date: data.date,
      is_split: false,
      created_at: now,
      updated_at: now,
    });
    router.back();
  }

  return (
    <TransactionForm
      initial={{ type: preselectedType as "income" | "expense" | undefined }}
      onSubmit={handleSubmit}
      loading={isPending}
    />
  );
}
