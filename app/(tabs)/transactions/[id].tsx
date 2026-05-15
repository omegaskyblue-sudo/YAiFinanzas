import { useLocalSearchParams, router } from "expo-router";
import { useLocalTransactions, useUpsertTransaction } from "@/hooks/useLocalData";
import TransactionForm from "@/components/TransactionForm";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: transactions } = useLocalTransactions();
  const { mutateAsync, isPending } = useUpsertTransaction();

  const tx = transactions?.find((t) => t.id === id);

  if (!tx) return null;
  const t = tx;

  async function handleSubmit(data: {
    amount: string;
    type: string;
    category_id: string | null;
    description: string;
    date: string;
  }) {
    await mutateAsync({
      id: t.id,
      couple_id: t.couple_id,
      created_by: t.created_by,
      amount: parseFloat(data.amount),
      type: data.type as "income" | "expense",
      category_id: data.category_id,
      description: data.description || null,
      date: data.date,
      is_split: t.is_split,
      created_at: t.created_at,
      updated_at: new Date().toISOString(),
    });
    router.back();
  }

  return (
    <TransactionForm
      initial={{
        amount: String(t.amount),
        type: t.type,
        category_id: t.category_id,
        description: t.description ?? "",
        date: t.date,
      }}
      onSubmit={handleSubmit}
      loading={isPending}
    />
  );
}
