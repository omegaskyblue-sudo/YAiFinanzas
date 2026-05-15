import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useLocalBudgets,
  useLocalCategories,
  useLocalTransactions,
  useDeleteBudget,
} from "@/hooks/useLocalData";
import { formatMonth } from "@/lib/utils";

function ProgressBar({ spent, amount }: { spent: number; amount: number }) {
  const pct = Math.min((spent / amount) * 100, 100);
  const over = spent > amount;

  return (
    <View className="mt-2">
      <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-indigo-500"}`}
          style={{ width: `${pct}%` }}
        />
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className={`text-xs ${over ? "text-red-500" : "text-gray-500"}`}>
          ${spent.toLocaleString("es-AR", { minimumFractionDigits: 2 })} gastados
        </Text>
        <Text className="text-xs text-gray-400">
          ${amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
}

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const now = useMemo(() => new Date(), []);
  const currentMonth = formatMonth(now);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: budgets = [] } = useLocalBudgets(currentMonth);
  const { data: categories = [] } = useLocalCategories();
  const { data: transactions = [] } = useLocalTransactions({
    month: currentMonth,
  });
  const { mutateAsync: deleteBudget } = useDeleteBudget();

  const categoryMap = useMemo(() => {
    const map: Record<string, { name: string; icon: string; color: string }> =
      {};
    for (const c of categories) {
      if (c.couple_id) map[c.id] = { name: c.name, icon: c.icon, color: c.color };
    }
    return map;
  }, [categories]);

  const budgetsWithSpent = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.category_id === b.category_id && t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      return { ...b, spent };
    });
  }, [budgets, transactions]);

  const uncategorizedExpense = useMemo(() => {
    return transactions
      .filter((t) => !t.category_id || t.type === "expense")
      .filter(
        (t) =>
          !budgets.find((b) => b.category_id === t.category_id),
      )
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions, budgets]);

  const monthName = now.toLocaleString("es-AR", {
    month: "long",
    year: "numeric",
  });

  async function handleDelete(id: string) {
    Alert.alert("Eliminar presupuesto", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteBudget(id),
      },
    ]);
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <FlatList
        data={budgetsWithSpent}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View className="px-4 py-3">
              <Text className="text-gray-500 text-sm font-medium">
                Presupuestos de {monthName}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                {budgets.length} categorías con presupuesto
              </Text>
            </View>

            {budgetsWithSpent.length === 0 && (
              <View className="py-12 items-center">
                <Text className="text-4xl mb-2">📊</Text>
                <Text className="text-gray-400 text-base">
                  No hay presupuestos este mes
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  Crea uno para controlar tus gastos
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => {
          const cat = categoryMap[item.category_id];
          return (
            <TouchableOpacity
              className="mx-4 mb-3 bg-gray-50 rounded-xl p-4"
              onLongPress={() => handleDelete(item.id)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">{cat?.icon ?? "📄"}</Text>
                  <View>
                    <Text className="text-gray-800 font-semibold">
                      {cat?.name ?? "Sin categoría"}
                    </Text>
                  </View>
                </View>
                <Text
                  className={`font-bold ${
                    item.spent > item.amount
                      ? "text-red-500"
                      : "text-green-600"
                  }`}
                >
                  {item.spent > item.amount ? "-" : ""}$
                  {Math.abs(item.amount - item.spent).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                  <Text className="text-gray-400 text-xs font-normal">
                    {" "}
                    restantes
                  </Text>
                </Text>
              </View>
              <ProgressBar spent={item.spent} amount={item.amount} />
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <View className="px-4 pt-4 pb-24">
            {uncategorizedExpense > 0 && (
              <View className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200">
                <Text className="text-amber-800 text-sm font-medium">
                  Gastos sin presupuesto
                </Text>
                <Text className="text-amber-600 text-lg font-bold mt-1">
                  ${uncategorizedExpense.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-indigo-600 rounded-xl py-3 mb-3"
              onPress={() => router.push("/(tabs)/budgets/new")}
            >
              <Text className="text-white text-center font-semibold">
                + Nuevo presupuesto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-gray-300 rounded-xl py-3"
              onPress={() => router.push("/(tabs)/budgets/categories")}
            >
              <Text className="text-gray-700 text-center font-medium">
                Gestionar categorías
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
